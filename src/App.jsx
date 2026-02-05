import { useEffect, useRef, useState } from 'react';
import {
  Button,
  ColorPicker,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Switch,
  Select,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import {
  AimOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  DownOutlined,
  UpOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Row, Col } from 'antd';
import dayjs from 'dayjs';
import { initGantt } from './gantt.js';
import { getLocale, setLocale, t } from './i18n';
import {
  initLastScrollX,
  showFilter,
  filter as filterParam,
  baseDate,
  dayMs,
  todayOffset,
  unitWidth,
  taskNamePaddingLeft,
  timeScaleHeight,
  milestoneTopHeight,
  barHeight,
  barMargin,
  scrollSpeed,
  includeHoliday,
  useLocal,
  useRemote,
  mockTaskSize,
  showArrow,
  debug,
  view,
  viewDate
} from './const';
import { getRandomColor } from './utils';

const { Header, Content } = Layout;

const DEFAULT_COLOR = '#1677ff';
const SETTINGS_STORAGE_KEY = 'gantt_setting';
function formatDateFromOffset(offsetDays) {
  const date = new Date(baseDate.getTime() + offsetDays * dayMs);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getOffsetFromDate(date) {
  if (!date) return 0;
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((startOfDay.getTime() - baseDate.getTime()) / dayMs);
}

function parseIcsDate(value, isDateOnly) {
  if (!value) return null;
  const dateOnlyMatch = /^\d{8}$/.test(value);
  if (isDateOnly || dateOnlyMatch) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    return new Date(year, month, day);
  }
  const utcMatch = /^\d{8}T\d{6}Z$/.test(value);
  if (utcMatch) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(9, 11));
    const minute = Number(value.slice(11, 13));
    const second = Number(value.slice(13, 15));
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  const localMatch = /^\d{8}T\d{6}$/.test(value);
  if (localMatch) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(9, 11));
    const minute = Number(value.slice(11, 13));
    const second = Number(value.slice(13, 15));
    return new Date(year, month, day, hour, minute, second);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function unfoldIcsLines(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const unfolded = [];
  lines.forEach(line => {
    if (!line) return;
    if (line.startsWith(' ') || line.startsWith('\t')) {
      const lastIndex = unfolded.length - 1;
      if (lastIndex >= 0) {
        unfolded[lastIndex] += line.slice(1);
      }
    } else {
      unfolded.push(line);
    }
  });
  return unfolded;
}

function parseIcs(text) {
  const lines = unfoldIcsLines(text);
  const events = [];
  let current = null;

  lines.forEach(line => {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      return;
    }
    if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
      return;
    }
    if (!current) return;
    const [rawKey, ...rest] = line.split(':');
    if (!rawKey || rest.length === 0) return;
    const value = rest.join(':').trim();
    const [key, ...params] = rawKey.split(';');
    current[key] = value;
    if (params.length) {
      current[`${key}__params`] = params.join(';');
    }
  });

  return events;
}

function mapEventsToTasks(events) {
  return events.map(event => {
    const summary = event.SUMMARY || t('ics.untitledEvent');
    const startParams = event.DTSTART__params || '';
    const endParams = event.DTEND__params || '';
    const startDate = parseIcsDate(event.DTSTART, startParams.includes('VALUE=DATE'));
    if (!startDate) return null;
    const endDate = parseIcsDate(event.DTEND, endParams.includes('VALUE=DATE'));
    const organizer = event.ORGANIZER || '';
    const offset = Math.floor((startDate.getTime() - baseDate.getTime()) / dayMs);
    const duration = endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / dayMs)) : 1;
    const resource = organizer.replace(/^mailto:/i, '').trim() || t('ics.importedOwner');
    return {
      name: summary,
      start: offset,
      duration,
      resource,
      fillColor: getRandomColor()
    };
  }).filter(Boolean);
}

function updateFilterParam(color) {
  const params = new URLSearchParams(location.search);
  if (color) {
    params.set('filter', color);
  } else {
    params.delete('filter');
  }
  const query = params.toString();
  location.href = query ? `${location.pathname}?${query}` : location.pathname;
}

function loadStoredSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveStoredSettings(values) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(values));
  } catch (error) {
    // ignore
  }
}

export default function App() {
  const ganttRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const [locale, setLocaleState] = useState(getLocale());
  const [scrollX, setScrollX] = useState(initLastScrollX);
  const [filterColors, setFilterColors] = useState([]);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, index: null });
  const [editOpen, setEditOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);
  const [createOpen, setCreateOpen] = useState(false);
  const [createPos, setCreatePos] = useState({ posX: 0, posY: 0 });
  const [createColor, setCreateColor] = useState(DEFAULT_COLOR);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm] = Form.useForm();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (!containerRef.current) return;
    const gantt = initGantt({
      container: containerRef.current,
      onScrollXChange: setScrollX,
      onEditTask: ({ index, task }) => {
        setEditIndex(index);
        setEditColor(task?.fillColor || DEFAULT_COLOR);
        editForm.setFieldsValue({
          name: task?.name || '',
          resource: task?.resource || '',
          fillColor: task?.fillColor || DEFAULT_COLOR
        });
        setEditOpen(true);
      },
      onContextMenu: ({ index, x, y }) => {
        setContextMenu({ open: true, x, y, index });
      },
      onHideContextMenu: () => {
        setContextMenu(prev => ({ ...prev, open: false }));
      },
      onCreateTask: ({ posX, posY }) => {
        setCreatePos({ posX, posY });
        setCreateColor(DEFAULT_COLOR);
        createForm.setFieldsValue({
          date: dayjs(baseDate.getTime() + posX * dayMs),
          name: '',
          resource: '',
          fillColor: DEFAULT_COLOR
        });
        setCreateOpen(true);
      },
      onDataChange: ({ colors }) => {
        setFilterColors(colors || []);
      }
    });
    ganttRef.current = gantt;
    setFilterColors(gantt.getFilterColors());
    return () => gantt.destroy?.();
  }, [createForm, editForm]);

  useEffect(() => {
    const stored = loadStoredSettings();
    if (!stored) return;
    const params = new URLSearchParams(location.search);
    const applyIfMissing = (key, value, fallback) => {
      if (params.has(key)) return;
      if (value === undefined || value === null || value === '') return;
      if (value === fallback) return;
      params.set(key, String(value));
    };
    applyIfMissing('unitWidth', stored.unitWidth, unitWidth);
    applyIfMissing('taskNamePaddingLeft', stored.taskNamePaddingLeft, taskNamePaddingLeft);
    applyIfMissing('timeScaleHeight', stored.timeScaleHeight, timeScaleHeight);
    applyIfMissing('milestoneTopHeight', stored.milestoneTopHeight, milestoneTopHeight);
    applyIfMissing('barHeight', stored.barHeight, barHeight);
    applyIfMissing('barMargin', stored.barMargin, barMargin);
    applyIfMissing('scrollSpeed', stored.scrollSpeed, scrollSpeed);
    applyIfMissing('mockTaskSize', stored.mockTaskSize, mockTaskSize || 0);
    applyIfMissing('view', stored.view, view || '');
    applyIfMissing('filter', stored.filter, filterParam || '');
    applyIfMissing('includeHoliday', stored.includeHoliday ? 1 : 0, includeHoliday ? 1 : 0);
    applyIfMissing('useLocal', stored.useLocal ? 1 : 0, useLocal ? 1 : 0);
    applyIfMissing('useRemote', stored.useRemote ? 1 : 0, useRemote ? 1 : 0);
    applyIfMissing('showFilter', stored.showFilter ? 1 : 0, showFilter ? 1 : 0);
    applyIfMissing('showArrow', stored.showArrow ? 1 : 0, showArrow ? 1 : 0);
    applyIfMissing('debug', stored.debug ? 1 : 0, debug ? 1 : 0);
    const query = params.toString();
    if (query !== location.search.replace(/^\?/, '')) {
      location.href = query ? `${location.pathname}?${query}` : location.pathname;
    }
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, open: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleLocaleChange = (value) => {
    setLocale(value);
    setLocaleState(value);
    ganttRef.current?.redraw?.();
  };

  const handleReset = () => {
    ganttRef.current?.resetScroll();
  };

  const handleClearTasks = () => {
    Modal.confirm({
      title: t('modal.clearTasksTitle'),
      content: t('modal.clearTasksContent'),
      okText: t('modal.okClear'),
      okButtonProps: { danger: true },
      onOk: () => ganttRef.current?.clearTasks()
    });
  };

  const handleClearMilestones = () => {
    Modal.confirm({
      title: t('modal.clearMilestonesTitle'),
      content: t('modal.clearMilestonesContent'),
      okText: t('modal.okClear'),
      okButtonProps: { danger: true },
      onOk: () => ganttRef.current?.clearMilestones()
    });
  };

  const handleEditSubmit = async () => {
    const values = await editForm.validateFields();
    ganttRef.current?.updateTask(editIndex, {
      ...values,
      fillColor: editColor || values.fillColor
    });
    setEditOpen(false);
  };

  const handleCreateSubmit = async () => {
    const values = await createForm.validateFields();
    ganttRef.current?.addTaskAt(createPos, {
      ...values,
      fillColor: createColor || values.fillColor
    });
    setCreateOpen(false);
  };

  const handleCreateClick = () => {
    setCreatePos({ posX: todayOffset, posY: 0 });
    setCreateColor(DEFAULT_COLOR);
    createForm.setFieldsValue({
      date: dayjs(baseDate.getTime() + todayOffset * dayMs),
      name: '',
      resource: '',
      fillColor: DEFAULT_COLOR
    });
    setCreateOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportData = () => {
    const payload = {
      tasks: JSON.parse(localStorage.getItem('tasks') || 'null') ?? window.tasks ?? [],
      mileStones: JSON.parse(localStorage.getItem('mileStones') || 'null') ?? window.mileStones ?? [],
      gantt_setting: JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null') ?? null
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gantt_export.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportDataClick = () => {
    jsonInputRef.current?.click();
  };

  const handleImportDataFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.tasks) {
        localStorage.setItem('tasks', JSON.stringify(data.tasks));
      }
      if (data.mileStones) {
        localStorage.setItem('mileStones', JSON.stringify(data.mileStones));
      }
      if (data.gantt_setting) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data.gantt_setting));
      }
      Modal.success({
        title: t('toast.importComplete'),
        content: t('toast.importDataSuccess')
      });
      setTimeout(() => location.reload(), 300);
    } catch (error) {
      Modal.error({
        title: t('toast.importFailed'),
        content: t('toast.importInvalidJson')
      });
    } finally {
      event.target.value = '';
    }
  };

  const dataMenuItems = [
    {
      key: 'import-ics',
      label: (
        <Tooltip title={t('data.importIcsTooltip')} placement="right">
          {t('data.importIcs')}
        </Tooltip>
      ),
      icon: <UploadOutlined />,
      onClick: handleImportClick
    },
    {
      key: 'export-json',
      label: (
        <Tooltip title={t('data.exportJsonTooltip')} placement="right">
          {t('data.exportJson')}
        </Tooltip>
      ),
      icon: <DownloadOutlined />,
      onClick: handleExportData
    },
    {
      key: 'import-json',
      label: (
        <Tooltip title={t('data.importJsonTooltip')} placement="right">
          {t('data.importJson')}
        </Tooltip>
      ),
      icon: <UploadOutlined />,
      onClick: handleImportDataClick
    }
  ];

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const events = parseIcs(text);
      const tasks = mapEventsToTasks(events);
      if (!tasks.length) {
        Modal.info({
          title: t('toast.noEventsTitle'),
          content: t('toast.noEventsContent')
        });
      } else {
        ganttRef.current?.addTasks(tasks);
        Modal.success({
          title: t('toast.importComplete'),
          content: t('toast.importIcsSuccess', { count: tasks.length, file: file.name })
        });
      }
    } catch (error) {
      Modal.error({
        title: t('toast.importFailed'),
        content: t('toast.importIcsFailed')
      });
    } finally {
      event.target.value = '';
    }
  };

  const contextMenuItems = [
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: t('menu.copyTask')
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('menu.deleteTask'),
      danger: true
    }
  ];

  const handleContextAction = ({ key }) => {
    if (contextMenu.index == null) return;
    if (key === 'copy') {
      ganttRef.current?.copyTask(contextMenu.index);
    }
    if (key === 'delete') {
      ganttRef.current?.deleteTask(contextMenu.index);
    }
    setContextMenu(prev => ({ ...prev, open: false }));
  };

  const handleOpenSettings = () => {
    const params = new URLSearchParams(location.search);
    const stored = loadStoredSettings() || {};
    const resolveViewValue = (value) => (value ? value : 'all');
    const getNumber = (key, fallback) => {
      const value = params.get(key);
      if (value === null || value === '') {
        return stored[key] ?? fallback;
      }
      return Number(value);
    };
    const getBool = (key, fallback) => {
      if (!params.has(key)) return stored[key] ?? fallback;
      const value = params.get(key);
      return value !== '0';
    };
    settingsForm.setFieldsValue({
      unitWidth: getNumber('unitWidth', unitWidth),
      taskNamePaddingLeft: getNumber('taskNamePaddingLeft', taskNamePaddingLeft),
      timeScaleHeight: getNumber('timeScaleHeight', timeScaleHeight),
      milestoneTopHeight: getNumber('milestoneTopHeight', milestoneTopHeight),
      barHeight: getNumber('barHeight', barHeight),
      barMargin: getNumber('barMargin', barMargin),
      scrollSpeed: getNumber('scrollSpeed', scrollSpeed),
      mockTaskSize: getNumber('mockTaskSize', mockTaskSize || 0),
      includeHoliday: getBool('includeHoliday', includeHoliday),
      useLocal: getBool('useLocal', Boolean(useLocal)),
      useRemote: getBool('useRemote', Boolean(useRemote)),
      showFilter: getBool('showFilter', showFilter),
      showArrow: getBool('showArrow', showArrow),
      debug: getBool('debug', debug),
      view: resolveViewValue(params.get('view') ?? stored.view ?? view ?? ''),
      filter: params.get('filter') ?? stored.filter ?? filterParam ?? ''
    });
    setSettingsOpen(true);
  };

  const handleApplySettings = async () => {
    const values = await settingsForm.validateFields();
    saveStoredSettings(values);
    const params = new URLSearchParams(location.search);
    const setOrDelete = (key, value, fallback) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
        return;
      }
      if (value === fallback) {
        params.delete(key);
        return;
      }
      params.set(key, String(value));
    };
    setOrDelete('unitWidth', values.unitWidth, unitWidth);
    setOrDelete('taskNamePaddingLeft', values.taskNamePaddingLeft, taskNamePaddingLeft);
    setOrDelete('timeScaleHeight', values.timeScaleHeight, timeScaleHeight);
    setOrDelete('milestoneTopHeight', values.milestoneTopHeight, milestoneTopHeight);
    setOrDelete('barHeight', values.barHeight, barHeight);
    setOrDelete('barMargin', values.barMargin, barMargin);
    setOrDelete('scrollSpeed', values.scrollSpeed, scrollSpeed);
    setOrDelete('mockTaskSize', values.mockTaskSize, mockTaskSize || 0);
    setOrDelete('view', values.view, view || '');
    setOrDelete('filter', values.filter, filterParam || '');
    setOrDelete('includeHoliday', values.includeHoliday ? 1 : 0, includeHoliday ? 1 : 0);
    setOrDelete('useLocal', values.useLocal ? 1 : 0, useLocal ? 1 : 0);
    setOrDelete('useRemote', values.useRemote ? 1 : 0, useRemote ? 1 : 0);
    setOrDelete('showFilter', values.showFilter ? 1 : 0, showFilter ? 1 : 0);
    setOrDelete('showArrow', values.showArrow ? 1 : 0, showArrow ? 1 : 0);
    setOrDelete('debug', values.debug ? 1 : 0, debug ? 1 : 0);
    const query = params.toString();
    location.href = query ? `${location.pathname}?${query}` : location.pathname;
  };

  const handleViewSwitch = (value) => {
    const nextView = value;
    const params = new URLSearchParams(location.search);
    params.set('view', nextView);
    if (nextView !== 'week' && nextView !== 'month') {
      params.delete('viewDate');
    }
    const stored = loadStoredSettings() || {};
    saveStoredSettings({ ...stored, view: nextView });
    const query = params.toString();
    location.href = query ? `${location.pathname}?${query}` : location.pathname;
  };

  const handleWeekNavigate = (direction) => {
    const params = new URLSearchParams(location.search);
    const anchor = viewDate ? dayjs(viewDate) : dayjs();
    if (direction === 'current') {
      params.delete('viewDate');
    } else {
      const next = anchor.add(direction * 7, 'day');
      params.set('viewDate', next.format('YYYY-MM-DD'));
    }
    params.set('view', 'week');
    const query = params.toString();
    location.href = query ? `${location.pathname}?${query}` : location.pathname;
  };

  const handleMonthNavigate = (direction) => {
    const params = new URLSearchParams(location.search);
    const anchor = viewDate ? dayjs(viewDate) : dayjs();
    if (direction === 'current') {
      params.delete('viewDate');
    } else {
      const next = anchor.add(direction, 'month');
      params.set('viewDate', next.format('YYYY-MM-DD'));
    }
    params.set('view', 'month');
    const query = params.toString();
    location.href = query ? `${location.pathname}?${query}` : location.pathname;
  };

  const viewValue = view || 'all';
  const isFixedView = viewValue === 'week' || viewValue === 'month';

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="toolbar">
          <Space className="toolbar-group" size="middle">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('app.title')}
            </Typography.Title>
            {!isFixedView && (
              <Tag color="blue" className="scroll-tag">{t('toolbar.scrollX', { value: scrollX })}</Tag>
            )}
            <Segmented
              value={viewValue}
              onChange={handleViewSwitch}
              options={[
                { label: t('toolbar.all'), value: 'all' },
                { label: t('toolbar.thisWeek'), value: 'week' },
                { label: t('toolbar.thisMonth'), value: 'month' }
              ]}
            />
            {viewValue === 'week' && (
              <Button.Group size="small">
                <Button icon={<LeftOutlined />} onClick={() => handleWeekNavigate(-1)}>
                  {t('toolbar.lastWeek')}
                </Button>
                <Button type="primary" onClick={() => handleWeekNavigate('current')}>
                  {t('toolbar.currentWeek')}
                </Button>
                <Button icon={<RightOutlined />} onClick={() => handleWeekNavigate(1)}>
                  {t('toolbar.nextWeek')}
                </Button>
              </Button.Group>
            )}
            {viewValue === 'month' && (
              <Button.Group size="small">
                <Button icon={<LeftOutlined />} onClick={() => handleMonthNavigate(-1)}>
                  {t('toolbar.lastMonth')}
                </Button>
                <Button type="primary" onClick={() => handleMonthNavigate('current')}>
                  {t('toolbar.currentMonth')}
                </Button>
                <Button icon={<RightOutlined />} onClick={() => handleMonthNavigate(1)}>
                  {t('toolbar.nextMonth')}
                </Button>
              </Button.Group>
            )}
          </Space>
          <Space className="toolbar-group" size="middle">
            {!isFixedView && (
              <Tooltip title={t('toolbar.scrollToToday')}>
                <Button icon={<AimOutlined />} onClick={handleReset}>
                </Button>
              </Tooltip>
            )}
            <Tooltip title={t('toolbar.createTaskTooltip')}>
              <Button icon={<PlusOutlined />} onClick={handleCreateClick}>
                {t('toolbar.createTask')}
              </Button>
            </Tooltip>
            <Tooltip title={t('toolbar.openSettings')}>
              <Button icon={<SettingOutlined />} onClick={handleOpenSettings}>
                {t('toolbar.settings')}
              </Button>
            </Tooltip>
            <Tooltip title={t('toolbar.clearTasksTooltip')}>
              <Button danger icon={<DeleteOutlined />} onClick={handleClearTasks}>
                {t('toolbar.clearTasks')}
              </Button>
            </Tooltip>
            <Tooltip title={t('toolbar.clearMilestonesTooltip')}>
              <Button danger icon={<DeleteOutlined />} onClick={handleClearMilestones}>
                {t('toolbar.clearMilestones')}
              </Button>
            </Tooltip>
            <Tooltip title={t('lang.switch')}>
              <Select
                value={locale}
                onChange={handleLocaleChange}
                style={{ width: 120 }}
                options={[
                  { label: t('lang.english'), value: 'en' },
                  { label: t('lang.chinese'), value: 'zh' }
                ]}
              />
            </Tooltip>
            <Dropdown
              menu={{ items: dataMenuItems }}
              placement="bottomLeft"
              trigger={['click']}
              onOpenChange={setDataMenuOpen}
            >
              <Tooltip title={dataMenuOpen ? '' : t('toolbar.importExport')}>
                <Button icon={<UploadOutlined />}>
                  {t('toolbar.data')} <span className="data-arrow">{dataMenuOpen ? <UpOutlined /> : <DownOutlined />}</span>
                </Button>
              </Tooltip>
            </Dropdown>
          </Space>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics,text/calendar"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <input
          ref={jsonInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImportDataFile}
        />
        {showFilter && (
          <div style={{ marginTop: 12 }}>
            <Space size="middle">
              <FilterOutlined />
              <Select
                value={filterParam || ''}
                placeholder={t('filter.placeholder')}
                style={{ width: 220 }}
                options={filterColors.map(color => ({
                  label: color ? (
                    <Space>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: 4,
                          background: color,
                          border: '1px solid #d9d9d9'
                        }}
                      />
                      {color}
                    </Space>
                  ) : (
                    t('filter.allColors')
                  ),
                  value: color
                }))}
                onChange={updateFilterParam}
                allowClear
              />
            </Space>
          </div>
        )}
      </Header>
      <Content className="canvas-wrapper">
        <div className="gantt-card">
          <div id="gantt-container" ref={containerRef} />
        </div>
      </Content>

      {contextMenu.open && (
        <div
          className="context-menu-overlay"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="context-menu-card">
            <Menu items={contextMenuItems} onClick={handleContextAction} />
          </div>
        </div>
      )}

      <Modal
        open={editOpen}
        title={t('modal.editTitle')}
        okText={t('modal.save')}
        onCancel={() => setEditOpen(false)}
        onOk={handleEditSubmit}
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item name="name" label={t('form.taskName')} rules={[{ required: true, message: t('form.taskNameRequired') }]}
          >
            <Input prefix={<EditOutlined />} placeholder={t('form.taskNamePlaceholder')} />
          </Form.Item>
          <Form.Item name="resource" label={t('form.owner')}>
            <Input placeholder={t('form.ownerPlaceholder')} />
          </Form.Item>
          <Form.Item name="fillColor" label={t('form.fillColor')} rules={[{ required: true, message: t('form.fillColorRequired') }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={editColor}
                onChange={e => {
                  const value = e.target.value;
                  setEditColor(value);
                  editForm.setFieldsValue({ fillColor: value });
                }}
                placeholder="#1677ff"
              />
              <ColorPicker
                value={editColor}
                onChange={(_, hex) => {
                  setEditColor(hex);
                  editForm.setFieldsValue({ fillColor: hex });
                }}
              />
            </Space.Compact>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={createOpen}
        title={t('modal.addTitle', { date: formatDateFromOffset(createPos.posX) })}
        okText={t('modal.create')}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreateSubmit}
      >
        <Form layout="vertical" form={createForm}>
          <Form.Item name="date" label={t('form.date')} rules={[{ required: true, message: t('form.dateRequired') }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              onChange={(value) => {
                const selected = value?.toDate?.() ?? null;
                setCreatePos(prev => ({
                  ...prev,
                  posX: getOffsetFromDate(selected)
                }));
              }}
            />
          </Form.Item>
          <Form.Item name="name" label={t('form.taskName')} rules={[{ required: true, message: t('form.taskNameRequired') }]}
          >
            <Input prefix={<PlusOutlined />} placeholder={t('form.taskNamePlaceholder')} />
          </Form.Item>
          <Form.Item name="resource" label={t('form.owner')}>
            <Input placeholder={t('form.ownerPlaceholder')} />
          </Form.Item>
          <Form.Item name="fillColor" label={t('form.fillColor')} rules={[{ required: true, message: t('form.fillColorRequired') }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={createColor}
                onChange={e => {
                  const value = e.target.value;
                  setCreateColor(value);
                  createForm.setFieldsValue({ fillColor: value });
                }}
                placeholder="#1677ff"
              />
              <ColorPicker
                value={createColor}
                onChange={(_, hex) => {
                  setCreateColor(hex);
                  createForm.setFieldsValue({ fillColor: hex });
                }}
              />
            </Space.Compact>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={settingsOpen}
        title={t('modal.settingsTitle')}
        okText={t('modal.apply')}
        width={900}
        onCancel={() => setSettingsOpen(false)}
        onOk={handleApplySettings}
      >
        <Form layout="vertical" form={settingsForm}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="unitWidth" label={t('form.unitWidth')}>
                <InputNumber min={40} max={400} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taskNamePaddingLeft" label={t('form.taskNamePadding')}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="timeScaleHeight" label={t('form.timeScaleHeight')}>
                <InputNumber min={10} max={80} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="milestoneTopHeight" label={t('form.milestoneTopHeight')}>
                <InputNumber min={10} max={80} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="barHeight" label={t('form.barHeight')}>
                <InputNumber min={10} max={80} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="barMargin" label={t('form.barMargin')}>
                <InputNumber min={0} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="scrollSpeed" label={t('form.scrollSpeed')}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mockTaskSize" label={t('form.mockTaskSize')}>
                <InputNumber min={0} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="view" label={t('form.view')}>
                <Select
                  options={[
                    { label: t('toolbar.all'), value: 'all' },
                    { label: t('toolbar.thisWeek'), value: 'week' },
                    { label: t('toolbar.thisMonth'), value: 'month' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="filter" label={t('form.filterColor')}>
                <Input placeholder="#RRGGBB" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="includeHoliday" label={t('form.includeHoliday')} valuePropName="checked">
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="useLocal" label={t('form.useLocal')} valuePropName="checked">
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="useRemote" label={t('form.useRemote')} valuePropName="checked">
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="showFilter" label={t('form.showFilter')} valuePropName="checked">
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="showArrow" label={t('form.showArrows')} valuePropName="checked">
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="debug" label={t('form.debug')} valuePropName="checked">
                <Switch size="small" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
}

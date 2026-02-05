import { useEffect, useRef, useState } from 'react';
import {
  Button,
  ColorPicker,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Select,
  Space,
  Tag,
  Typography
} from 'antd';
import {
  AimOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { initGantt } from './gantt.js';
import { initLastScrollX, showFilter, filter as filterParam, baseDate, dayMs } from './const';
import { getRandomColor } from './utils';

const { Header, Content } = Layout;

const DEFAULT_COLOR = '#1677ff';
function formatDateFromOffset(offsetDays) {
  const date = new Date(baseDate.getTime() + offsetDays * dayMs);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    const summary = event.SUMMARY || 'Untitled event';
    const startParams = event.DTSTART__params || '';
    const endParams = event.DTEND__params || '';
    const startDate = parseIcsDate(event.DTSTART, startParams.includes('VALUE=DATE'));
    if (!startDate) return null;
    const endDate = parseIcsDate(event.DTEND, endParams.includes('VALUE=DATE'));
    const organizer = event.ORGANIZER || '';
    const offset = Math.floor((startDate.getTime() - baseDate.getTime()) / dayMs);
    const duration = endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / dayMs)) : 1;
    const resource = organizer.replace(/^mailto:/i, '').trim() || 'Imported';
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

export default function App() {
  const ganttRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [scrollX, setScrollX] = useState(initLastScrollX);
  const [filterColors, setFilterColors] = useState([]);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0, index: null });
  const [editOpen, setEditOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);
  const [createOpen, setCreateOpen] = useState(false);
  const [createPos, setCreatePos] = useState({ posX: 0, posY: 0 });
  const [createColor, setCreateColor] = useState(DEFAULT_COLOR);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

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
    const handleClick = () => setContextMenu(prev => ({ ...prev, open: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleReset = () => {
    ganttRef.current?.resetScroll();
  };

  const handleClearTasks = () => {
    Modal.confirm({
      title: 'Clear all tasks?',
      content: 'This will reset the task list to empty rows.',
      okText: 'Clear',
      okButtonProps: { danger: true },
      onOk: () => ganttRef.current?.clearTasks()
    });
  };

  const handleClearMilestones = () => {
    Modal.confirm({
      title: 'Clear all milestones?',
      content: 'This action cannot be undone.',
      okText: 'Clear',
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const events = parseIcs(text);
      const tasks = mapEventsToTasks(events);
      if (!tasks.length) {
        Modal.info({
          title: 'No events found',
          content: 'The .ics file did not contain any importable events.'
        });
      } else {
        ganttRef.current?.addTasks(tasks);
        Modal.success({
          title: 'Import complete',
          content: `Imported ${tasks.length} event${tasks.length === 1 ? '' : 's'} from ${file.name}.`
        });
      }
    } catch (error) {
      Modal.error({
        title: 'Import failed',
        content: 'Unable to read this .ics file.'
      });
    } finally {
      event.target.value = '';
    }
  };

  const contextMenuItems = [
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: 'Copy task'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete task',
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

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="toolbar">
          <Space className="toolbar-group" size="middle">
            <Typography.Title level={4} style={{ margin: 0 }}>
              Gantt Planner
            </Typography.Title>
            <Tag color="blue">Scroll X: {scrollX}</Tag>
          </Space>
          <Space className="toolbar-group" size="middle">
            <Button icon={<AimOutlined />} onClick={handleReset}>
              Today
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => ganttRef.current?.redraw()}>
              Refresh
            </Button>
            <Button icon={<UploadOutlined />} onClick={handleImportClick}>
              Import .ics
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleClearTasks}>
              Clear tasks
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleClearMilestones}>
              Clear milestones
            </Button>
          </Space>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics,text/calendar"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {showFilter && (
          <div style={{ marginTop: 12 }}>
            <Space size="middle">
              <FilterOutlined />
              <Select
                value={filterParam || ''}
                placeholder="Filter by color"
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
                    'All colors'
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
        title="Edit task"
        okText="Save"
        onCancel={() => setEditOpen(false)}
        onOk={handleEditSubmit}
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item name="name" label="Task name" rules={[{ required: true, message: 'Enter a task name' }]}
          >
            <Input prefix={<EditOutlined />} placeholder="Task name" />
          </Form.Item>
          <Form.Item name="resource" label="Owner" rules={[{ required: true, message: 'Enter an owner' }]}
          >
            <Input placeholder="Owner" />
          </Form.Item>
          <Form.Item name="fillColor" label="Fill color" rules={[{ required: true, message: 'Choose a color' }]}
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
        title={`Add task on ${formatDateFromOffset(createPos.posX)}`}
        okText="Create"
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreateSubmit}
      >
        <Form layout="vertical" form={createForm}>
          <Form.Item name="name" label="Task name" rules={[{ required: true, message: 'Enter a task name' }]}
          >
            <Input prefix={<PlusOutlined />} placeholder="Task name" />
          </Form.Item>
          <Form.Item name="resource" label="Owner" rules={[{ required: true, message: 'Enter an owner' }]}
          >
            <Input placeholder="Owner" />
          </Form.Item>
          <Form.Item name="fillColor" label="Fill color" rules={[{ required: true, message: 'Choose a color' }]}
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
    </Layout>
  );
}

const STORAGE_KEY = 'gantt_lang';
const SUPPORTED_LOCALES = ['en', 'zh'];

const messages = {
  en: {
    app: {
      title: 'Gantt Planner',
      remoteSuffix: ' (Remote)'
    },
    toolbar: {
      scrollX: 'Scroll X: {value}',
      all: 'All',
      thisWeek: 'This week',
      thisMonth: 'This month',
      lastWeek: 'Last',
      currentWeek: 'Current week',
      nextWeek: 'Next',
      lastMonth: 'Last',
      currentMonth: 'Current month',
      nextMonth: 'Next',
      scrollToToday: 'Scroll to today',
      createTask: 'Create task',
      createTaskTooltip: 'Create a new task',
      openSettings: 'Open settings',
      settings: 'Settings',
      clearTasks: 'Clear tasks',
      clearTasksTooltip: 'Clear all tasks',
      clearMilestones: 'Clear milestones',
      clearMilestonesTooltip: 'Clear all milestones',
      importExport: 'Import / Export',
      data: 'Data'
    },
    filter: {
      label: 'Filter by color',
      placeholder: 'Filter by color',
      allColors: 'All colors'
    },
    modal: {
      clearTasksTitle: 'Clear all tasks?',
      clearTasksContent: 'This will reset the task list to empty rows.',
      clearMilestonesTitle: 'Clear all milestones?',
      clearMilestonesContent: 'This action cannot be undone.',
      okClear: 'Clear',
      editTitle: 'Edit task',
      save: 'Save',
      addTitle: 'Add task on {date}',
      create: 'Create',
      settingsTitle: 'Settings',
      apply: 'Apply'
    },
    form: {
      taskName: 'Task name',
      taskNamePlaceholder: 'Task name',
      taskNameRequired: 'Enter a task name',
      owner: 'Owner',
      ownerPlaceholder: 'Owner',
      fillColor: 'Fill color',
      fillColorRequired: 'Choose a color',
      date: 'Date',
      dateRequired: 'Select a date',
      unitWidth: 'Unit width',
      taskNamePadding: 'Task name padding',
      timeScaleHeight: 'Time scale height',
      milestoneTopHeight: 'Milestone top height',
      barHeight: 'Bar height',
      barMargin: 'Bar margin',
      scrollSpeed: 'Scroll speed',
      mockTaskSize: 'Mock task size',
      view: 'View',
      filterColor: 'Filter color',
      includeHoliday: 'Include holiday',
      useLocal: 'Use local',
      useRemote: 'Use remote',
      showFilter: 'Show filter',
      showArrows: 'Show arrows',
      debug: 'Debug'
    },
    data: {
      importIcsTooltip: 'Import Apple Calendar .ics',
      importIcs: 'Import .ics',
      exportJsonTooltip: 'Export tasks, milestones, and settings as JSON',
      exportJson: 'Export data (JSON)',
      importJsonTooltip: 'Import tasks, milestones, and settings from JSON',
      importJson: 'Import data (JSON)'
    },
    toast: {
      importComplete: 'Import complete',
      importDataSuccess: 'Local data has been imported. The page will reload to apply changes.',
      importFailed: 'Import failed',
      importInvalidJson: 'Invalid JSON file.',
      noEventsTitle: 'No events found',
      noEventsContent: 'The .ics file did not contain any importable events.',
      importIcsSuccess: ({ count, file }) => `Imported ${count} event${count === 1 ? '' : 's'} from ${file}.`,
      importIcsFailed: 'Unable to read this .ics file.'
    },
    menu: {
      copyTask: 'Copy task',
      deleteTask: 'Delete task'
    },
    lang: {
      label: 'Language',
      switch: 'Switch language',
      english: 'English',
      chinese: '中文'
    },
    ics: {
      untitledEvent: 'Untitled event',
      importedOwner: 'Imported'
    },
    gantt: {
      taskNamePrompt: 'Task name?',
      assignPrompt: 'Assign to who?',
      createMilestoneConfirm: 'Do you want to create a milestone here?',
      milestoneNamePrompt: 'Milestone name?',
      deleteMilestoneConfirm: 'Do you want to delete the milestone here?',
      milestoneDefaultName: 'Milestone',
      demoMilestoneName: 'Milestone'
    },
    contextMenu: {
      deleteConfirm: 'Are you sure to DELETE the task?'
    }
  },
  zh: {
    app: {
      title: 'Gantt Planner',
      remoteSuffix: '（远程）'
    },
    toolbar: {
      scrollX: '滚动 X：{value}',
      all: '全部',
      thisWeek: '本周',
      thisMonth: '本月',
      lastWeek: '上周',
      currentWeek: '本周',
      nextWeek: '下周',
      lastMonth: '上月',
      currentMonth: '本月',
      nextMonth: '下月',
      scrollToToday: '滚动到今天',
      createTask: '创建任务',
      createTaskTooltip: '创建新任务',
      openSettings: '打开设置',
      settings: '设置',
      clearTasks: '清空任务',
      clearTasksTooltip: '清空所有任务',
      clearMilestones: '清空里程碑',
      clearMilestonesTooltip: '清空所有里程碑',
      importExport: '导入 / 导出',
      data: '数据'
    },
    filter: {
      label: '按颜色筛选',
      placeholder: '按颜色筛选',
      allColors: '全部颜色'
    },
    modal: {
      clearTasksTitle: '清空所有任务？',
      clearTasksContent: '这将把任务列表重置为空行。',
      clearMilestonesTitle: '清空所有里程碑？',
      clearMilestonesContent: '此操作无法撤销。',
      okClear: '清空',
      editTitle: '编辑任务',
      save: '保存',
      addTitle: '在 {date} 添加任务',
      create: '创建',
      settingsTitle: '设置',
      apply: '应用'
    },
    form: {
      taskName: '任务名称',
      taskNamePlaceholder: '任务名称',
      taskNameRequired: '请输入任务名称',
      owner: '负责人',
      ownerPlaceholder: '负责人',
      fillColor: '填充颜色',
      fillColorRequired: '请选择颜色',
      date: '日期',
      dateRequired: '请选择日期',
      unitWidth: '列宽',
      taskNamePadding: '任务名称内边距',
      timeScaleHeight: '时间刻度高度',
      milestoneTopHeight: '里程碑顶部高度',
      barHeight: '条形高度',
      barMargin: '条形间距',
      scrollSpeed: '滚动速度',
      mockTaskSize: '模拟任务数',
      view: '视图',
      filterColor: '筛选颜色',
      includeHoliday: '包含节假日',
      useLocal: '使用本地数据',
      useRemote: '使用远程数据',
      showFilter: '显示筛选器',
      showArrows: '显示箭头',
      debug: '调试'
    },
    data: {
      importIcsTooltip: '导入 Apple 日历 .ics',
      importIcs: '导入 .ics',
      exportJsonTooltip: '导出任务、里程碑与设置为 JSON',
      exportJson: '导出数据（JSON）',
      importJsonTooltip: '从 JSON 导入任务、里程碑与设置',
      importJson: '导入数据（JSON）'
    },
    toast: {
      importComplete: '导入完成',
      importDataSuccess: '本地数据已导入，页面将刷新以应用更改。',
      importFailed: '导入失败',
      importInvalidJson: '无效的 JSON 文件。',
      noEventsTitle: '未找到事件',
      noEventsContent: '.ics 文件中没有可导入的事件。',
      importIcsSuccess: ({ count, file }) => `已从 ${file} 导入 ${count} 个事件。`,
      importIcsFailed: '无法读取此 .ics 文件。'
    },
    menu: {
      copyTask: '复制任务',
      deleteTask: '删除任务'
    },
    lang: {
      label: '语言',
      switch: '切换语言',
      english: 'English',
      chinese: '中文'
    },
    ics: {
      untitledEvent: '未命名事件',
      importedOwner: '导入'
    },
    gantt: {
      taskNamePrompt: '任务名称？',
      assignPrompt: '分配给谁？',
      createMilestoneConfirm: '确定在此创建里程碑吗？',
      milestoneNamePrompt: '里程碑名称？',
      deleteMilestoneConfirm: '确定删除此处的里程碑吗？',
      milestoneDefaultName: '里程碑',
      demoMilestoneName: '提测'
    },
    contextMenu: {
      deleteConfirm: '确定删除该任务吗？'
    }
  }
};

function resolveLocale(input) {
  if (!input) return null;
  const normalized = String(input).toLowerCase();
  if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
  return null;
}

function getLocaleFromStorage() {
  try {
    return resolveLocale(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

function getLocaleFromNavigator() {
  if (typeof navigator === 'undefined') return null;
  const lang = navigator.language || navigator.userLanguage;
  if (!lang) return null;
  return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

let currentLocale = getLocaleFromStorage() || getLocaleFromNavigator() || 'en';

export const getLocale = () => currentLocale;

export const setLocale = (locale, { persist = true } = {}) => {
  const next = resolveLocale(locale) || 'en';
  currentLocale = next;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      // ignore
    }
  }
};

function resolveMessage(locale, key) {
  const parts = key.split('.');
  let current = messages[locale];
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null;
    current = current[part];
  }
  return current ?? null;
}

export const t = (key, params = {}, locale = currentLocale) => {
  const message = resolveMessage(locale, key) ?? resolveMessage('en', key);
  if (typeof message === 'function') {
    return message(params);
  }
  if (typeof message !== 'string') {
    return key;
  }
  return message.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params[token];
    return value === undefined || value === null ? '' : String(value);
  });
};

export const getAvailableLocales = () => [...SUPPORTED_LOCALES];

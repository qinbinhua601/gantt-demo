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
  ReloadOutlined
} from '@ant-design/icons';
import { initGantt } from './gantt.js';
import { initLastScrollX, showFilter, filter as filterParam } from './const';

const { Header, Content } = Layout;

const DEFAULT_COLOR = '#1677ff';
const BASE_DATE = new Date('2024-01-01T00:00:00');

function formatDateFromOffset(offsetDays) {
  const date = new Date(BASE_DATE.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
            <Button danger icon={<DeleteOutlined />} onClick={handleClearTasks}>
              Clear tasks
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleClearMilestones}>
              Clear milestones
            </Button>
          </Space>
        </div>
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

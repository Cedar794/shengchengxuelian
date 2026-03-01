/**
 * GitHub风格看板组件
 * 支持拖拽、任务管理
 */
import React, { useState } from 'react';
import { Plus, MoreHorizontal, User, Calendar, Flag } from 'lucide-react';

const KanbanBoard = ({ tasks = [], onTaskMove, onTaskClick, onAddTask }) => {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: '待办', color: 'bg-gray-100', borderColor: 'border-gray-300' },
    { id: 'in_progress', title: '进行中', color: 'bg-blue-50', borderColor: 'border-blue-400' },
    { id: 'done', title: '已完成', color: 'bg-green-50', borderColor: 'border-green-400' },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'normal': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '高';
      case 'normal': return '中';
      case 'low': return '低';
      default: return '中';
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      onTaskMove?.(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-72"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className={`flex items-center justify-between p-3 rounded-t-lg ${column.color} border-t-2 ${column.borderColor}`}>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-700">{column.title}</h3>
              <span className="px-2 py-0.5 text-xs bg-white rounded-full text-gray-500">
                {getTasksByStatus(column.id).length}
              </span>
            </div>
            <button
              onClick={() => onAddTask?.(column.id)}
              className="p-1 hover:bg-white rounded transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Task List */}
          <div className={`p-2 rounded-b-lg ${column.color} min-h-[200px] space-y-2`}>
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onClick={() => onTaskClick?.(task)}
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Task Title */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-800 flex-1">{task.title}</h4>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Task Description */}
                {task.description && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Task Footer */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    {/* Priority */}
                    <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-3 h-3 inline mr-1" />
                      {getPriorityLabel(task.priority)}
                    </span>
                    {/* Assignee */}
                    {task.assignee_id && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  {/* Due Date */}
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.due_date)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {getTasksByStatus(column.id).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无任务
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;

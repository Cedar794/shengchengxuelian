/**
 * 审批中心页面
 * 线上审批·自动流转功能
 */
import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, FileText, ArrowRight, User, Building } from 'lucide-react';

const Approval = () => {
  const [activeTab, setActiveTab] = useState('pending');

  // 模拟审批数据
  const approvals = [
    {
      id: 1,
      type: 'venue',
      title: '体育馆主馆预约申请',
      applicant: '张三',
      department: '篮球社团',
      createTime: '2025-03-01 10:30',
      status: 'pending',
      currentStep: 1,
      steps: [
        { name: '学工部审批', status: 'approved', approver: '李老师', time: '2025-03-01 11:00' },
        { name: '保卫处审批', status: 'pending', approver: '王老师' },
        { name: '后勤审批', status: 'waiting' },
      ]
    },
    {
      id: 2,
      type: 'activity',
      title: '校园歌手大赛场地申请',
      applicant: '李四',
      department: '学生会文艺部',
      createTime: '2025-02-28 14:20',
      status: 'in_progress',
      currentStep: 2,
      steps: [
        { name: '学生会审批', status: 'approved', approver: '赵主席', time: '2025-02-28 15:00' },
        { name: '团委审批', status: 'approved', approver: '陈老师', time: '2025-02-28 16:30' },
        { name: '后勤审批', status: 'in_progress', approver: '刘主任' },
      ]
    },
    {
      id: 3,
      type: 'publicity',
      title: '春季招新海报审批',
      applicant: '王五',
      department: '摄影社',
      createTime: '2025-02-27 09:15',
      status: 'approved',
      currentStep: 3,
      steps: [
        { name: '社团联审批', status: 'approved', approver: '周老师', time: '2025-02-27 10:00' },
        { name: '宣传部审批', status: 'approved', approver: '吴老师', time: '2025-02-27 14:00' },
        { name: '保卫处审批', status: 'approved', approver: '郑老师', time: '2025-02-27 16:00' },
      ]
    },
  ];

  const pendingCount = approvals.filter(a => a.status === 'pending' || a.status === 'in_progress').length;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'venue': return '场地预约';
      case 'activity': return '活动申请';
      case 'publicity': return '宣传审批';
      default: return '其他';
    }
  };

  const filteredApprovals = activeTab === 'all'
    ? approvals
    : approvals.filter(a => a.status === 'pending' || a.status === 'in_progress');

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            审批中心
          </h1>
          <p className="text-gray-500 mt-1">线上审批·自动流转</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待审批</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已通过</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已拒绝</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            待审批 ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            全部记录
          </button>
        </div>

        {/* 审批列表 */}
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* 审批头部 */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(approval.status)}`}>
                        {approval.status === 'approved' ? '已通过' : approval.status === 'in_progress' ? '审批中' : '待审批'}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {getTypeLabel(approval.type)}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">{approval.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {approval.applicant}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {approval.department}
                      </span>
                      <span>{approval.createTime}</span>
                    </div>
                  </div>
                  {getStatusIcon(approval.status)}
                </div>
              </div>

              {/* 审批流程 */}
              <div className="p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3">审批流程</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {approval.steps.map((step, index) => (
                    <React.Fragment key={index}>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                        step.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : step.status === 'in_progress' || step.status === 'pending'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {getStatusIcon(step.status)}
                        <span>{step.name}</span>
                        {step.approver && (
                          <span className="text-xs opacity-70">({step.approver})</span>
                        )}
                      </div>
                      {index < approval.steps.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              {(approval.status === 'pending' || approval.status === 'in_progress') && (
                <div className="p-4 flex justify-end gap-2">
                  <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    查看详情
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors">
                    拒绝
                  </button>
                  <button className="px-4 py-2 text-sm bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors">
                    通过
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredApprovals.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无审批记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approval;

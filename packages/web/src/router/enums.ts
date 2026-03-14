// 完整版菜单比较多，将 rank 抽离出来，在此方便维护

const home = 0, // 平台规定只有 home 路由的 rank 才能为 0 ，所以后端在返回 rank 的时候需要从非 0 开始
  // Business modules
  dashboard = 1,
  finance = 2,
  health = 3,
  fashion = 4,
  knowledge = 5,
  news = 6,
  tasks = 7,
  schedule = 8,
  contacts = 9,
  aiChat = 10,
  settings = 11,
  system = 12,
  error = 13;

export {
  home,
  dashboard,
  finance,
  health,
  fashion,
  knowledge,
  news,
  tasks,
  schedule,
  contacts,
  aiChat,
  settings,
  system,
  error
};

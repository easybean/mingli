const DEFAULT_BY_STYLE = {
  bold: {
    actionLabel: '直接推进',
    actionHint: '先抢主动权，收益更快，波动也更大。',
  },
  steady: {
    actionLabel: '分步处理',
    actionHint: '先把结构做稳，再逐步放大收益。',
  },
  repair: {
    actionLabel: '收口减损',
    actionHint: '先止漏、降损耗，给后面留余量。',
  },
};

const THEME_ACTION_LIBRARY = {
  career: [
    {
      pattern: /谈条件|分工|过渡|试水|留底|递交证据|磨合|双线|写清规则|划定分工边界/,
      actionLabel: '谈判定界',
      actionHint: '先把权责、节奏和边界谈清楚，再往前走。',
    },
    {
      pattern: /接手|攻坚|奔赴|澄清|换轨|争取|推进|调任|全盘|加速/,
      actionLabel: '抢位推进',
      actionHint: '更像抢窗口、争位置，短期压力会上来。',
    },
    {
      pattern: /推脱|坚守|复盘|止损|撤出|防护|本地|拒绝/,
      actionLabel: '抽身保底',
      actionHint: '不硬扛，先保住精力、底线和长期空间。',
    },
  ],
  wealth: [
    {
      pattern: /投入|全额|高杠杆|进场|置换|扩张|借出/,
      actionLabel: '押注扩张',
      actionHint: '把更多筹码压上去，回报和波动都会变大。',
    },
    {
      pattern: /试水|一半|书面|小幅|分步|轻压力|观察/,
      actionLabel: '控仓试探',
      actionHint: '不一次压满，先用小步试探换取判断空间。',
    },
    {
      pattern: /拒绝|稳健|理财|保留|不借|止损|存款/,
      actionLabel: '守住本金',
      actionHint: '先保现金流和安全垫，不让局面拖垮自己。',
    },
  ],
  relationship: [
    {
      pattern: /摊牌|交心|直面|谈心|说清|奖惩|坦诚/,
      actionLabel: '正面沟通',
      actionHint: '把问题摊到桌面上，换清晰，但也会更刺痛。',
    },
    {
      pattern: /分次|缓冲|调整|循序|轻松|考察|引导/,
      actionLabel: '慢调关系',
      actionHint: '不硬碰，先慢慢调互动节奏和相处方式。',
    },
    {
      pattern: /淡出|减少|止损|分开|降低期待|不再主动/,
      actionLabel: '收紧边界',
      actionHint: '先把损耗降下来，再决定这段关系留多深。',
    },
  ],
  health: [
    {
      pattern: /优先赶进度|硬扛|直接办理|全年大额|压下情绪/,
      actionLabel: '硬顶输出',
      actionHint: '先保推进，但很容易透支身体和情绪余量。',
    },
    {
      pattern: /调整工时|固定|试水|季度卡|散心|运动|适应节奏/,
      actionLabel: '调时回补',
      actionHint: '一边维持节奏，一边给身体和情绪留恢复窗口。',
    },
    {
      pattern: /大幅减负|养身|预约心理咨询|不办卡|专心养身|疏导/,
      actionLabel: '减负修复',
      actionHint: '把恢复放到更前面，先救回长期耐力。',
    },
  ],
  mindset: [
    {
      pattern: /拼命追赶|接下所有|全力投入|抛开顾虑/,
      actionLabel: '向外突破',
      actionHint: '主动把自己推向更高压、更高增长的位置。',
    },
    {
      pattern: /拆分|试探|中性|减少信息输入|定量|稳步推进/,
      actionLabel: '拆步试探',
      actionHint: '把问题拆小，一边观察，一边往前挪。',
    },
    {
      pattern: /接纳自我|放下对比|规避|熟悉的事|悲观直觉/,
      actionLabel: '回收内耗',
      actionHint: '先把心力收回来，减少被比较和风险拖空。',
    },
  ],
  family: [
    {
      pattern: /坚持自我|正面|全额帮|贴身|全权照料/,
      actionLabel: '正面扛事',
      actionHint: '你来接主要责任，推进快，但消耗也会更重。',
    },
    {
      pattern: /分步|阶段性|小额|约束|就近|定时/,
      actionLabel: '分步承接',
      actionHint: '能帮，但不一次把自己全部搭进去。',
    },
    {
      pattern: /妥协|敷衍|只提供|护工|托管|无力帮扶/,
      actionLabel: '留出边界',
      actionHint: '先守住自己的承受线，再决定还要承担多少。',
    },
  ],
  migration: [
    {
      pattern: /敲定计划|全家搬迁|果断辞职|返乡创业/,
      actionLabel: '立刻迁动',
      actionHint: '直接切换地图，机会更大，但不确定性也最高。',
    },
    {
      pattern: /试水|稳定后|双城兼顾|线上创业/,
      actionLabel: '双线试水',
      actionHint: '不一下子翻桌，先在两条路之间保留回旋。',
    },
    {
      pattern: /放弃搬迁|坚守故土|坚守大城市|适应内卷/,
      actionLabel: '原地稳盘',
      actionHint: '不换地图，重点改成稳住现有盘面和节奏。',
    },
  ],
};

const matchThemeAction = (theme, label) => {
  const rules = THEME_ACTION_LIBRARY[theme] || [];
  return rules.find((item) => item.pattern.test(label));
};

export const choicePresentation = (choice = {}, context = {}) => {
  const label = String(choice.label || '');
  const theme = context.theme || '';
  const matched = matchThemeAction(theme, label);
  const fallback = DEFAULT_BY_STYLE[choice.style] || DEFAULT_BY_STYLE.steady;

  return {
    actionLabel: matched?.actionLabel || fallback.actionLabel,
    actionHint: matched?.actionHint || fallback.actionHint,
  };
};

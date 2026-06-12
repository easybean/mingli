export const createReadingViewModel = (state) => {
  const data = state.astrolabeData;
  if (!data) {
    return { ready: false, sections: [] };
  }

  const sections = [
    {
      id: 'bazi',
      title: '八字基础',
      summary: data.reading.manual?.[0]?.body || data.reading.headline,
    },
    ...data.reading.topics.slice(0, 5).map((topic, index) => ({
      id: `topic-${index}`,
      title: topic.title,
      summary: topic.takeaway || topic.summary,
    })),
  ];

  return {
    ready: true,
    intro: '这里解释为什么系统给出这些关卡。依据层默认收起，避免一开始变成术语墙。',
    sections,
  };
};

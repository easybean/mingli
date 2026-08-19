import { shareTextForWorkStory } from '../domain/work-story/share-model.js';

const wrap = (context, text, maxWidth) => String(text || '').split('').reduce((lines, character) => {
  const last = lines[lines.length - 1] || '';
  if (context.measureText(`${last}${character}`).width > maxWidth && last) lines.push(character);
  else lines[lines.length - 1] = `${last}${character}`;
  return lines;
}, ['']);

const textBlock = (context, text, x, y, maxWidth, lineHeight, maxLines = 3) => {
  const lines = wrap(context, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
};

const singleLine = (context, text, maxWidth) => {
  const suffix = '…';
  let value = String(text || '');
  while (value && context.measureText(value).width > maxWidth) value = value.slice(0, -1);
  return value === String(text || '') ? value : `${value.slice(0, Math.max(0, value.length - suffix.length))}${suffix}`;
};

export const renderWorkStoryShareCard = (canvas, model) => {
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('浏览器不支持分享卡绘制。');
  context.fillStyle = '#11192c';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#25365e';
  context.fillRect(0, 0, width, 220);
  context.fillStyle = '#a6c8ff';
  context.font = '34px sans-serif';
  context.fillText('MINGLI · 工作岔路', 80, 108);
  context.fillStyle = '#f5f2e9';
  context.font = 'bold 64px sans-serif';
  textBlock(context, model.hook, 80, 205, 900, 72, 3);
  context.fillStyle = '#a6c8ff';
  context.font = 'bold 32px sans-serif';
  context.fillText(singleLine(context, `我的结果｜${model.routeEnding}`, 900), 80, 440);
  context.font = '34px sans-serif';
  context.fillStyle = '#f5f2e9';
  textBlock(context, model.insight, 80, 505, 900, 49, 2);
  context.fillStyle = '#b7c9eb';
  context.font = '30px sans-serif';
  textBlock(context, `命盘提醒：${model.chartPrompt}`, 80, 635, 900, 44, 2);
  context.fillStyle = '#f5f2e9';
  context.font = 'bold 30px sans-serif';
  context.fillText('我得到', 80, 770);
  context.fillText('我也放弃', 560, 770);
  context.font = '28px sans-serif';
  context.fillStyle = '#d9e4f8';
  textBlock(context, model.gain, 80, 820, 400, 42, 3);
  textBlock(context, model.cost, 560, 820, 400, 42, 3);
  context.fillStyle = '#f5f2e9';
  context.font = 'bold 38px sans-serif';
  textBlock(context, model.question, 80, 1010, 900, 54, 3);
  context.fillStyle = '#91a9d5';
  context.font = '26px sans-serif';
  context.fillText('来走一遍你的工作岔路', 80, 1225);
  context.fillText(model.siteUrl, 80, 1270);
  return canvas;
};

export const createWorkStorySharePng = (model, documentRef = document) => {
  const canvas = documentRef.createElement('canvas');
  renderWorkStoryShareCard(canvas, model);
  return { canvas, dataUrl: canvas.toDataURL('image/png') };
};

export const downloadWorkStorySharePng = (model, documentRef = document) => {
  const { dataUrl } = createWorkStorySharePng(model, documentRef);
  const anchor = documentRef.createElement('a');
  anchor.href = dataUrl;
  anchor.download = 'mingli-work-story.png';
  anchor.click();
  return dataUrl;
};

const canvasBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

export const shareWorkStoryCard = async (model, { navigatorRef = navigator, documentRef = document } = {}) => {
  const text = shareTextForWorkStory(model);
  if (!navigatorRef?.share) return { method: 'download', dataUrl: downloadWorkStorySharePng(model, documentRef) };
  const { canvas } = createWorkStorySharePng(model, documentRef);
  const blob = await canvasBlob(canvas);
  const file = typeof File === 'function' && blob ? new File([blob], 'mingli-work-story.png', { type: 'image/png' }) : null;
  const payload = file && (!navigatorRef.canShare || navigatorRef.canShare({ files: [file] }))
    ? { title: model.routeEnding, text, url: model.siteUrl, files: [file] }
    : { title: model.routeEnding, text, url: model.siteUrl };
  await navigatorRef.share(payload);
  return { method: 'native' };
};

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
  textBlock(context, `《${model.storyTitle}》`, 80, 205, 900, 70, 2);
  context.font = '34px sans-serif';
  context.fillStyle = '#b7c9eb';
  textBlock(context, `命盘底色：${model.chartTone}`, 80, 372, 900, 48, 2);
  context.fillStyle = '#f5f2e9';
  context.font = 'bold 34px sans-serif';
  context.fillText('我的 3 个关键选择', 80, 500);
  context.font = '32px sans-serif';
  (model.keyChoices.length ? model.keyChoices : ['这一轮还没有留下足够的选择记录']).slice(0, 3).forEach((choice, index) => {
    context.fillStyle = '#d9e4f8';
    context.fillText(singleLine(context, `${index + 1}. ${choice}`, 870), 96, 558 + index * 54);
  });
  context.fillStyle = '#f5f2e9';
  context.font = 'bold 34px sans-serif';
  context.fillText(singleLine(context, `路线结局：${model.routeEnding}`, 900), 80, 760);
  context.font = '32px sans-serif';
  context.fillStyle = '#d9e4f8';
  textBlock(context, model.routeSummary, 80, 818, 900, 46, 2);
  context.fillStyle = '#f5f2e9';
  context.font = 'bold 34px sans-serif';
  context.fillText('另一种可能', 80, 970);
  context.font = '32px sans-serif';
  context.fillStyle = '#d9e4f8';
  textBlock(context, model.alternative, 80, 1028, 900, 46, 3);
  context.fillStyle = '#91a9d5';
  context.font = '26px sans-serif';
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

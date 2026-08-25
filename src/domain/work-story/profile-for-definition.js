export const profileForStoryDefinition = (definition, astrolabeData) => {
  if (definition?.themeId === 'relationship') return astrolabeData?.reading?.relationshipStoryProfile;
  if (definition?.themeId === 'finance') return astrolabeData?.reading?.financeStoryProfile;
  return astrolabeData?.reading?.workStoryProfile;
};

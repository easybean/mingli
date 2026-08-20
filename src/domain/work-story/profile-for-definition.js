export const profileForStoryDefinition = (definition, astrolabeData) => definition?.themeId === 'relationship'
  ? astrolabeData?.reading?.relationshipStoryProfile
  : astrolabeData?.reading?.workStoryProfile;

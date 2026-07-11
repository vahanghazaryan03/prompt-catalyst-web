// navigation.js

export const openHelpPage = () => {
  // Using window.location.origin ensures it works in both development and production
  const helpUrl = `${window.location.origin}/help`;
  window.open(helpUrl, '_blank');
};
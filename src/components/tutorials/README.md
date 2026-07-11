# Tutorials Section

This directory contains the tutorials feature of the Prompt Catalyst web application. The tutorials are designed to help users understand how to use different features of the application effectively.

## Directory Structure

- `Tutorials.js` - Main component that displays the tutorial list and detailed tutorial views
- `Tutorials.css` - Styles for the tutorials component
- `index.js` - Exports the Tutorials component
- `content/` - Directory containing individual tutorial files
  - `index.js` - Imports and exports all tutorials as an array
  - `template.js` - Template for creating new tutorials
  - Individual tutorial files (e.g., `midjourney.js`, `marketing.js`)

## How to Add a New Tutorial

1. **Create a new tutorial file**:
   - Copy `content/template.js` to a new file with a descriptive name (e.g., `seo-prompts.js`)
   - Fill in all the fields with your tutorial content
   - Make sure to assign a unique ID (increment from the highest existing ID)
   - Add relevant tags

2. **Add tutorial images**:
   - Add your tutorial images to the public directory:
     - Cover image: `/public/images/tutorials/your-tutorial-name.png`
     - Hero image: `/public/images/tutorials/your-tutorial-hero.jpg`

3. **Import and register your tutorial**:
   - Open `content/index.js`
   - Import your new tutorial at the top of the file:
     ```javascript
     import yourTutorialName from './your-tutorial-file';
     ```
   - Add your tutorial to the `tutorialData` array:
     ```javascript
     const tutorialData = [
       midjourneyTutorial,
       marketingTutorial,
       yourTutorialName,
       // Other tutorials...
     ];
     ```

4. **Test your tutorial**:
   - Start the development server and navigate to the tutorials section
   - Verify that your tutorial appears in the list and can be viewed in detail

## Markdown Formatting Guidelines

When writing tutorial content, use markdown formatting for structure and readability:

- `#` for main title
- `##` for sections
- `###` for subsections
- `**bold text**` for emphasis
- `-` for bullet points
- `1. 2. 3.` for numbered lists

## Best Practices for Tutorials

1. **Keep it concise** - Focus on practical, actionable information
2. **Use examples** - Include concrete examples that users can follow
3. **Step-by-step instructions** - Break down complex processes into clear steps
4. **Visual aids** - Use images to illustrate key concepts when possible
5. **Tips section** - Include helpful tips that users might not figure out on their own
// template.js - A template for creating new tutorials
// Copy this file and rename it when creating a new tutorial

const tutorialTemplate = {
  id: 0, // Assign a unique ID (increment from the highest existing ID)
  title: "Tutorial Title Goes Here",
  slug: "tutorial-title-goes-here", // URL-friendly version of the title (lowercase with hyphens)
  excerpt: "A brief 1-2 sentence summary of what this tutorial teaches.",
  author: "Author Name",
  date: "Month Day, Year",
  readTime: "X min read",
  coverImage: "/images/tutorials/your-tutorial-image.png", // Add image to public folder
  heroImage: {
    url: "/images/tutorials/your-hero-image.jpg", // Add image to public folder
    alt: "Description of the hero image for accessibility",
    attribution: "Attribution information if needed"
  },
  content: `
# Tutorial Title Goes Here

Introductory paragraph explaining what users will learn in this tutorial.

## First Main Section

Explain the first main concept or step in your tutorial.

- **Key Point 1**: Description
- **Key Point 2**: Description
- **Key Point 3**: Description

## Second Main Section

Explain the second main concept or step in your tutorial.

1. **Step One**

   Details about step one.

2. **Step Two**

   Details about step two.

3. **Step Three**

   Details about step three.

## Examples

### Example 1: Example Title

**Details**: Information about this example.

### Example 2: Another Example

**Details**: Information about this second example.

## Tips for Success

- **Tip 1**: Description
- **Tip 2**: Description
- **Tip 3**: Description

Concluding paragraph summarizing the key takeaways and encouraging users to apply what they've learned.
  `,
  tags: ["Tag1", "Tag2", "Tag3"] // Add relevant tags
};

export default tutorialTemplate;

/*
INSTRUCTIONS FOR CREATING A NEW TUTORIAL:

1. Copy this template file and rename it to something descriptive (e.g., 'seo-prompts.js')
2. Fill in all the fields with your tutorial content
3. Use Markdown formatting in the content field
4. Make sure to include a slug field for SEO-friendly URLs (use lowercase letters and hyphens to separate words, no special characters)
5. Import your new tutorial in the 'content/index.js' file
6. Add your tutorial to the tutorialData array in 'content/index.js'
7. Make sure to increment the ID from the highest existing tutorial ID

MARKDOWN FORMATTING TIPS:
- Use # for main title, ## for sections, ### for subsections
- Use **bold text** for emphasis
- Use - for bullet points
- Use 1. 2. 3. for numbered lists
*/
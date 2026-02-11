// Load projects from projects.json
async function loadProjects() {
  try {
    const response = await fetch('/projects.json');
    const data = await response.json();
    return data.projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

// Get category color based on category name
function getCategoryColor(category) {
  const colors = {
    'Branding': 'var(--red)',
    'Design System': 'var(--yellow)',
    'Architecture': 'var(--blue)',
    'Execution': 'var(--blue)'
  };
  return colors[category] || 'var(--yellow)';
}

// Initialize projects when page loads
let projectData = {};

(async function initProjects() {
  const projects = await loadProjects();

  // Convert array to object for easy lookup
  projects.forEach(project => {
    projectData[project.id] = {
      category: project.category,
      categoryColor: getCategoryColor(project.category),
      title: project.title,
      subtitle: project.description,
      client: project.client,
      year: project.year,
      location: project.location,
      scope: project.scope,
      description: project.fullDescription,
      mainImage: project.mainImage,
      galleryImages: project.galleryImages
    };
  });

  // Update project cards on page
  updateProjectCards(projects);

  console.log('Projects loaded:', Object.keys(projectData).length);
})();

// Update project cards with data from JSON
function updateProjectCards(projects) {
  const projectCards = document.querySelectorAll('.project-large');

  projectCards.forEach((card, index) => {
    if (projects[index]) {
      const project = projects[index];
      const img = card.querySelector('.project-large-image img');
      const category = card.querySelector('.project-large-category');
      const title = card.querySelector('.project-large-title');
      const description = card.querySelector('.project-large-description');

      if (img) img.src = project.mainImage;
      if (category) category.textContent = project.category;
      if (title) title.textContent = project.title;
      if (description) description.textContent = project.description;
    }
  });
}

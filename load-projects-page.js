// Get project ID from URL parameter
function getProjectIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Load projects from JSON
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

// Get category color
function getCategoryColor(category) {
  const colors = {
    'Branding': 'var(--red)',
    'Design System': 'var(--yellow)',
    'Architecture': 'var(--blue)',
    'Execution': 'var(--blue)'
  };
  return colors[category] || 'var(--yellow)';
}

// Generate gallery image paths
function generateImagePaths(imageFolder, imageCount) {
  const images = [];
  for (let i = 2; i <= imageCount; i++) {
    const num = i.toString().padStart(2, '0');
    images.push(`${imageFolder}${num}.png`);
  }
  return images;
}

// Load and display project when page loads
(async function initProjectPage() {
  const projectId = getProjectIdFromURL();
  
  if (!projectId) {
    console.error('No project ID in URL');
    return;
  }
  
  const projects = await loadProjects();
  const project = projects.find(p => p.id == projectId);
  
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }
  
  // Generate gallery images
  const galleryImages = generateImagePaths(project.imageFolder, project.imageCount);
  
  // Update page with project data
  displayProject({
    category: project.category,
    categoryColor: getCategoryColor(project.category),
    title: project.title,
    subtitle: project.description,
    client: project.client,
    year: project.year,
    location: project.location,
    scope: project.scope,
    description: project.fullDescription,
    mainImage: `${project.imageFolder}01.png`,
    galleryImages: galleryImages
  });
})();

// Display project details on page
function displayProject(project) {
  // Update category badge
  const categoryBadge = document.querySelector('.project-category');
  if (categoryBadge) {
    categoryBadge.textContent = project.category;
    categoryBadge.style.color = project.categoryColor;
  }
  
  // Update title
  const titleElement = document.querySelector('.project-title');
  if (titleElement) {
    titleElement.textContent = project.title;
  }
  
  // Update subtitle
  const subtitleElement = document.querySelector('.project-subtitle');
  if (subtitleElement) {
    subtitleElement.textContent = project.subtitle;
  }
  
  // Update main image
  const mainImage = document.querySelector('.project-main-image img');
  if (mainImage) {
    mainImage.src = project.mainImage;
    mainImage.alt = project.title;
  }
  
  // Update project details
  const clientElement = document.querySelector('.project-detail-client');
  if (clientElement) clientElement.textContent = project.client;
  
  const yearElement = document.querySelector('.project-detail-year');
  if (yearElement) yearElement.textContent = project.year;
  
  const locationElement = document.querySelector('.project-detail-location');
  if (locationElement) locationElement.textContent = project.location;
  
  const scopeElement = document.querySelector('.project-detail-scope');
  if (scopeElement) scopeElement.textContent = project.scope;
  
  // Update description paragraphs
  const descriptionContainer = document.querySelector('.project-description');
  if (descriptionContainer && project.description) {
    descriptionContainer.innerHTML = '';
    project.description.forEach(paragraph => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      descriptionContainer.appendChild(p);
    });
  }
  
  // Update gallery images
  const galleryContainer = document.querySelector('.project-gallery');
  if (galleryContainer && project.galleryImages) {
    galleryContainer.innerHTML = '';
    project.galleryImages.forEach(imageSrc => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'gallery-image';
      
      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = project.title;
      img.loading = 'lazy';
      
      imgWrapper.appendChild(img);
      galleryContainer.appendChild(imgWrapper);
    });
  }
  
  console.log('✅ Project loaded:', project.title);
}

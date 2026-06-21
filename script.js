const seedList = document.getElementById('seedList');
const selectedSeedText = document.getElementById('selectedSeed');
const selectedCountText = document.getElementById('selectedCount');
const gardenGrid = document.getElementById('gardenGrid');

// Starting seed inventory with counts for planting.
const seedData = [
  { name: 'Carrot', count: 6, emoji: '🥕' },
  { name: 'Tomato', count: 4, emoji: '🍅' },
  { name: 'Pumpkin', count: 3, emoji: '🎃' },
  { name: 'Sunflower', count: 5, emoji: '🌻' },
];

let selectedSeed = null;
const gridSize = 8;
const growIntervalMinutes = 1;
const growStages = 10;
const intervalMs = growIntervalMinutes * 60 * 1000;
const plantedPlots = Array(gridSize * gridSize).fill(null);

// Render the list of seeds in the sidebar.
function renderSeedList() {
  seedList.innerHTML = '';

  seedData.forEach((seed) => {
    const item = document.createElement('li');
    item.className = 'seed-item';
    if (selectedSeed === seed) {
      item.classList.add('selected');
    }

    item.innerHTML = `
      <div class="label">
        <strong>${seed.name}</strong>
        <span>${seed.emoji}</span>
      </div>
      <span>${seed.count} left</span>
    `;

    item.addEventListener('click', () => {
      selectedSeed = seed;
      renderSeedList();
      renderSelectedSeed();
    });

    seedList.appendChild(item);
  });
}

// Update the selected seed info shown in the sidebar.
function renderSelectedSeed() {
  if (!selectedSeed) {
    selectedSeedText.textContent = 'Nothing selected yet.';
    selectedCountText.textContent = '';
    return;
  }

  selectedSeedText.textContent = `${selectedSeed.emoji} ${selectedSeed.name}`;
  selectedCountText.textContent = `Seeds remaining: ${selectedSeed.count}`;
}

// Create the 8x8 garden grid with clickable plots.
function createGardenGrid() {
  gardenGrid.innerHTML = '';

  for (let i = 0; i < gridSize * gridSize; i += 1) {
    const plot = document.createElement('button');
    plot.type = 'button';
    plot.className = 'plot';
    plot.dataset.index = String(i);
    plot.title = 'Empty dirt plot';
    plot.innerHTML = `
      <span class="plot-icon"></span>
      <div class="progress-bar"><div class="progress-fill"></div></div>
    `;

    plot.addEventListener('click', () => handlePlotClick(i, plot));
    gardenGrid.appendChild(plot);
  }
}

function updatePlotDisplay(index, plot, planted) {
  const icon = plot.querySelector('.plot-icon');
  const progressFill = plot.querySelector('.progress-fill');

  if (!planted) {
    plot.classList.remove('planted', 'ready');
    icon.textContent = '';
    progressFill.style.width = '0%';
    plot.title = 'Empty dirt plot';
    return;
  }

  const progress = Math.min(planted.stage, growStages);
  const width = (progress / growStages) * 100;
  progressFill.style.width = `${width}%`;

  if (planted.ready) {
    plot.classList.add('planted', 'ready');
    icon.textContent = '🌾';
    plot.title = `Ready to harvest ${planted.seedName}`;
    return;
  }

  plot.classList.add('planted');
  plot.classList.remove('ready');
  icon.textContent = planted.emoji;
  plot.title = `Growing ${planted.seedName}: ${progress}/${growStages}`;
}

function advanceGrowth() {
  plantedPlots.forEach((planted, index) => {
    if (!planted || planted.ready) {
      return;
    }

    planted.stage += 1;
    if (planted.stage >= growStages) {
      planted.ready = true;
    }

    const plot = gardenGrid.querySelector(`[data-index="${index}"]`);
    if (plot) {
      updatePlotDisplay(index, plot, planted);
    }
  });
}

// Handle clicking on a dirt plot to plant the currently selected seed.
function handlePlotClick(index, plot) {
  if (!selectedSeed) {
    alert('Select a seed first on the left before planting.');
    return;
  }

  if (selectedSeed.count <= 0) {
    alert(`No more ${selectedSeed.name} seeds left.`);
    return;
  }

  if (plantedPlots[index]) {
    alert('This plot already has a seed planted. Choose another plot.');
    return;
  }

  // Mark the plot as planted and update the inventory.
  plantedPlots[index] = {
    seedName: selectedSeed.name,
    emoji: selectedSeed.emoji,
    stage: 0,
    ready: false,
  };
  selectedSeed.count -= 1;

  updatePlotDisplay(index, plot, plantedPlots[index]);
  renderSeedList();
  renderSelectedSeed();
}

renderSeedList();
renderSelectedSeed();
createGardenGrid();
setInterval(advanceGrowth, intervalMs);

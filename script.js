const seedList = document.getElementById('seedList');
const toolList = document.getElementById('toolList');
const selectedSeedText = document.getElementById('selectedSeed');
const selectedCountText = document.getElementById('selectedCount');
const gardenGrid = document.getElementById('gardenGrid');

// Seeds and tools stored separately.
const seedData = [
  { name: 'Wortel', count: 6, type: 'seed', emoji: '🥕', growIntervalSeconds: 1 },
  { name: 'Tomaat', count: 4, type: 'seed', emoji: '🍅', growIntervalSeconds: 45 },
  { name: 'Aardbei', count: 3, type: 'seed', emoji: '🍓', growIntervalSeconds: 50 },
  { name: 'Mais', count: 5, type: 'seed', emoji: '🌽', growIntervalSeconds: 55 },
  { name: 'Brocolli', count: 5, type: 'seed', emoji: '🥦', growIntervalSeconds: 60 }
];

const toolData = [
  { name: 'Water', type: 'tool', emoji: '💧', action: 'water', label: 'Water growing plots' },
  { name: 'Oogsten', type: 'tool', emoji: '🔪', action: 'harvest', label: 'Harvest ready plots' }
];

let selectedItem = null;
const gridSize = 8;
const growStages = 10;
const maxWaterLevel = 5;
const tickMs = 1000;
const plotStates = Array.from({ length: gridSize * gridSize }, () => ({
  waterLevel: 1,
  planted: null,
}));

// Render the list of seeds in the sidebar.
function renderSeedList() {
  seedList.innerHTML = '';

  seedData.forEach((seed) => {
    const item = document.createElement('li');
    item.className = 'seed-item';
    if (selectedItem === seed) {
      item.classList.add('selected');
    }

    item.innerHTML = `
      <div class="label">
        <strong>${seed.name}</strong>
        <span>${seed.emoji}</span>
      </div>
      <span>${seed.count} left · ${seed.growIntervalSeconds}s/stage</span>
    `;

    item.addEventListener('click', () => {
      selectedItem = seed;
      renderSeedList();
      renderToolList();
      renderSelectedSeed();
    });

    seedList.appendChild(item);
  });
}

function renderToolList() {
  toolList.innerHTML = '';

  toolData.forEach((tool) => {
    const item = document.createElement('li');
    item.className = 'seed-item';
    if (selectedItem === tool) {
      item.classList.add('selected');
    }

    item.innerHTML = `
      <div class="label">
        <strong>${tool.name}</strong>
        <span>${tool.emoji}</span>
      </div>
      <span>${tool.label}</span>
    `;

    item.addEventListener('click', () => {
      selectedItem = tool;
      renderSeedList();
      renderToolList();
      renderSelectedSeed();
    });

    toolList.appendChild(item);
  });
}

// Update the selected seed info shown in the sidebar.
function renderSelectedSeed() {
  if (!selectedItem) {
    selectedSeedText.textContent = 'Nothing selected yet.';
    selectedCountText.textContent = '';
    return;
  }

  selectedSeedText.textContent = `${selectedItem.emoji} ${selectedItem.name}`;
  selectedCountText.textContent = selectedItem.type === 'seed'
    ? `Seeds remaining: ${selectedItem.count}`
    : selectedItem.label;
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
    updatePlotDisplay(i, plot, plotStates[i]);
  }
}

function updatePlotDisplay(index, plot, state) {
  const icon = plot.querySelector('.plot-icon');
  const progressFill = plot.querySelector('.progress-fill');
  const planted = state.planted;

  plot.classList.remove('dry-1', 'dry-2', 'dry-3', 'dry-4', 'dry-5');
  plot.classList.add(`dry-${Math.ceil(state.waterLevel)}`);

  if (!planted) {
    plot.classList.remove('planted', 'ready');
    icon.textContent = '';
    progressFill.style.width = '0%';
    plot.title = state.waterLevel === 1
      ? 'Dry soil - water first'
      : `Soil water level ${state.waterLevel.toFixed(1)}/${maxWaterLevel}`;
    return;
  }

  const progress = planted.ready
    ? growStages
    : planted.stage + planted.elapsed / planted.growIntervalSeconds;
  const width = (progress / growStages) * 100;
  progressFill.style.width = `${Math.min(width, 100)}%`;

  if (planted.ready) {
    plot.classList.add('planted', 'ready');
    icon.textContent = '🌾';
    plot.title = `Ready to harvest ${planted.seedName}`;
    return;
  }

  plot.classList.add('planted');
  plot.classList.remove('ready');
  icon.textContent = planted.emoji;
  plot.title = state.waterLevel === 1
    ? `Growing ${planted.seedName} (needs water)`
    : `Growing ${planted.seedName} - water ${state.waterLevel.toFixed(1)}/${maxWaterLevel}`;
}

function advanceGrowth() {
  plotStates.forEach((state, index) => {
    if (state.waterLevel > 1) {
      state.waterLevel = Math.max(1, state.waterLevel - 0.01);
    }

    const planted = state.planted;
    if (planted && !planted.ready && state.waterLevel > 1) {
      planted.elapsed += 1;
      if (planted.elapsed >= planted.growIntervalSeconds) {
        planted.elapsed -= planted.growIntervalSeconds;
        planted.stage += 1;
      }

      if (planted.stage >= growStages) {
        planted.stage = growStages;
        planted.ready = true;
        planted.elapsed = 0;
      }
    }

    const plot = gardenGrid.querySelector(`[data-index="${index}"]`);
    if (plot) {
      updatePlotDisplay(index, plot, state);
    }
  });
}

// Handle clicking on a dirt plot to plant the currently selected seed.
function handlePlotClick(index, plot) {
  if (!selectedItem) {
    return;
  }

  const state = plotStates[index];

  if (selectedItem.type === 'tool') {
    if (selectedItem.action === 'water') {
      state.waterLevel = maxWaterLevel;
      updatePlotDisplay(index, plot, state);
      return;
    }

    if (selectedItem.action === 'harvest') {
      if (!state.planted || !state.planted.ready) {
        return;
      }

      state.planted = null;
      updatePlotDisplay(index, plot, state);
      return;
    }

    return;
  }

  if (selectedItem.count <= 0) {
    return;
  }

  if (state.waterLevel === 1) {
    return;
  }

  if (state.planted) {
    return;
  }

  // Mark the plot as planted and update the inventory.
  state.planted = {
    seedName: selectedItem.name,
    emoji: selectedItem.emoji,
    growIntervalSeconds: selectedItem.growIntervalSeconds,
    stage: 0,
    elapsed: 0,
    ready: false,
  };
  selectedItem.count -= 1;

  updatePlotDisplay(index, plot, state);
  renderSeedList();
  renderToolList();
  renderSelectedSeed();
}

renderSeedList();
renderToolList();
renderSelectedSeed();
createGardenGrid();
setInterval(advanceGrowth, tickMs);

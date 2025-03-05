document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé');
  
  // Vérifier si les éléments du DOM sont correctement trouvés
  console.log('Formulaire d\'ajustement:', document.getElementById('adjustment-form'));
  console.log('Bouton de soumission:', document.querySelector('#adjustment-form button[type="submit"]'));
  console.log('Champ start-time:', document.getElementById('start-time'));
  console.log('Champ work-hours:', document.getElementById('work-hours'));
  console.log('Champ uniform-end-time:', document.getElementById('uniform-end-time'));
  console.log('Champ current-date:', document.getElementById('current-date'));
  console.log('Champ current-time:', document.getElementById('current-time'));
  console.log('Champ hours-worked:', document.getElementById('hours-worked'));
  console.log('Champ minutes-worked:', document.getElementById('minutes-worked'));
  console.log('Champ continue-today:', document.getElementById('continue-today'));
  console.log('Champ today-limit:', document.getElementById('today-limit'));
  
  // Initialiser la date et l'heure actuelles
  updateCurrentDateTime();
  
  // Mettre à jour l'heure toutes les minutes
  setInterval(() => {
    updateCurrentDateTime();
  }, 60000); // Mettre à jour toutes les minutes
  
  // Fonction pour mettre à jour la date et l'heure actuelles
  function updateCurrentDateTime() {
    const now = new Date();
    
    // Mettre à jour l'heure
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time').value = `${currentHours}:${currentMinutes}`;
    
    // Mettre à jour la date
    const formattedDate = now.toISOString().split('T')[0];
    document.getElementById('current-date').value = formattedDate;
    
    // Mettre à jour l'affichage du jour de façon plus compacte
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const monthsOfYear = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    const currentDayName = daysOfWeek[now.getDay()];
    const currentDay = now.getDate();
    const currentMonth = monthsOfYear[now.getMonth()];
    
    document.getElementById('current-day-display').innerHTML = 
      `<div class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
        <i class="fas fa-calendar-alt text-blue-500"></i>
      </div>
      <span class="w-full pl-8 pr-2 py-2 bg-white text-blue-800 text-sm font-medium rounded-md shadow-sm border border-blue-200 inline-flex items-center justify-center">
        ${currentDayName} ${currentDay} ${currentMonth}
      </span>`;
      
    // Ajouter une animation pour indiquer le rafraîchissement
    const refreshButton = document.getElementById('refresh-datetime');
    if (refreshButton) {
      refreshButton.classList.add('animate-spin');
      setTimeout(() => {
        refreshButton.classList.remove('animate-spin');
      }, 500);
    }
  }
  
  // Ajouter un gestionnaire d'événements pour le bouton de rafraîchissement
  const refreshButton = document.getElementById('refresh-datetime');
  if (refreshButton) {
    refreshButton.addEventListener('click', updateCurrentDateTime);
  }
  
  // Gestion de l'affichage de la limite pour aujourd'hui
  const continueTodayCheckbox = document.getElementById('continue-today');
  const todayLimitContainer = document.getElementById('today-limit-container');
  
  function updateTodayLimitVisibility() {
    if (continueTodayCheckbox.checked) {
      todayLimitContainer.style.display = 'block';
    } else {
      todayLimitContainer.style.display = 'none';
    }
  }
  
  // Initialiser la visibilité
  updateTodayLimitVisibility();
  
  // Gérer le changement d'état de la case à cocher
  continueTodayCheckbox.addEventListener('change', updateTodayLimitVisibility);
  
  // Gestionnaire d'événements pour le formulaire d'ajustement
  const adjustmentForm = document.getElementById('adjustment-form');
  if (adjustmentForm) {
    adjustmentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Formulaire d\'ajustement soumis');
      calculateRemainingSchedule();
    });
  } else {
    console.error('Le formulaire d\'ajustement n\'a pas été trouvé dans le DOM');
  }
  
  // Ajouter un gestionnaire d'événements directement sur le bouton de soumission
  const adjustmentSubmitButton = document.querySelector('#adjustment-form button[type="submit"]');
  if (adjustmentSubmitButton) {
    adjustmentSubmitButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Bouton de soumission du formulaire d\'ajustement cliqué');
      calculateRemainingSchedule();
    });
  } else {
    console.error('Le bouton de soumission du formulaire d\'ajustement n\'a pas été trouvé dans le DOM');
  }
  
  // Gestion du toggle pour l'heure de fin uniforme
  const uniformEndTimeCheckbox = document.getElementById('uniform-end-time');
  
  if (uniformEndTimeCheckbox) {
    uniformEndTimeCheckbox.addEventListener('change', function() {
      // Pas besoin d'afficher un champ supplémentaire, juste enregistrer l'état
      console.log('Terminer à la même heure:', this.checked);
    });
  }
  
  // Initialiser les valeurs affichées pour les sliders
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  days.forEach(day => {
    const slider = document.getElementById(`${day}-lunch`);
    const valueDisplay = document.getElementById(`${day}-lunch-value`);
    
    // Mettre à jour l'affichage initial
    valueDisplay.textContent = slider.value;
    
    // Ajouter un écouteur d'événement pour mettre à jour l'affichage lors du changement
    slider.addEventListener('input', function() {
      valueDisplay.textContent = this.value;
    });
  });
  
  // Load saved configuration
  chrome.storage.local.get(['schedule', 'uniformEndTime', 'targetEndTime'], (data) => {
    if (data.uniformEndTime) {
      uniformEndTimeCheckbox.checked = true;
      
      if (data.targetEndTime) {
        document.getElementById('target-end-time').value = data.targetEndTime;
      }
    }
    
    if (data.schedule) {
      const firstDay = data.schedule.monday;
      document.getElementById('start-time').value = firstDay.start;
      
      // Calculate weekly hours from daily schedule (assuming 5-day work week)
      const dailyHours = (parseInt(firstDay.end.split(':')[0]) * 60 + parseInt(firstDay.end.split(':')[1]) - 
                         (parseInt(firstDay.start.split(':')[0]) * 60 + parseInt(firstDay.start.split(':')[1])) - 
                         firstDay.lunch) / 60;
      document.getElementById('work-hours').value = (dailyHours * 5).toFixed(1);
      
      // Set lunch breaks and limits for each day
      Object.entries(data.schedule).forEach(([day, times]) => {
        const lunchSlider = document.getElementById(`${day}-lunch`);
        lunchSlider.value = times.lunch;
        document.getElementById(`${day}-lunch-value`).textContent = times.lunch;
        
        if (times.limit) {
          document.getElementById(`${day}-limit`).value = times.limit;
        }
      });
      
      // Afficher les résultats sauvegardés
      displayResults(data.schedule);
    }
  });

  // Gestion des onglets
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Initialiser l'indicateur pour l'onglet actif au chargement
  document.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
      activeTab.querySelector('.tab-indicator').classList.remove('hidden');
    }
  });

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // Supprimer la classe active de tous les boutons et masquer tous les indicateurs
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.querySelector('.tab-indicator').classList.add('hidden');
      });
      
      // Masquer tous les panneaux
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Activer le bouton et le panneau sélectionnés et afficher l'indicateur
      button.classList.add('active');
      button.querySelector('.tab-indicator').classList.remove('hidden');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Fonction pour calculer l'heure de fin
  function calculateEndTime(startTime, workHours, lunchBreak) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    const workMinutes = workHours * 60;
    const endTimeMinutes = totalMinutes + workMinutes + lunchBreak;
    
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMinutes = Math.round(endTimeMinutes % 60);
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  // Fonction pour calculer l'heure de début à partir de l'heure de fin
  function calculateStartTime(endTime, workHours, lunchBreak) {
    const [hours, minutes] = endTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    const workMinutes = workHours * 60;
    const startTimeMinutes = totalMinutes - workMinutes - lunchBreak;
    
    const startHours = Math.floor(startTimeMinutes / 60);
    const startMinutes = Math.round(startTimeMinutes % 60);
    
    return `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
  }

  // Fonction pour configurer la sauvegarde automatique des données
  function setupAutoSave() {
    // Liste des champs à surveiller
    const fields = [
      'start-time',
      'work-hours',
      'uniform-end-time',
      'monday-lunch',
      'tuesday-lunch',
      'wednesday-lunch',
      'thursday-lunch',
      'friday-lunch',
      'monday-limit',
      'tuesday-limit',
      'wednesday-limit',
      'thursday-limit',
      'friday-limit'
    ];
    
    // Ajouter des écouteurs d'événements pour chaque champ
    fields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        // Utiliser l'événement approprié selon le type d'élément
        const eventType = element.type === 'checkbox' ? 'change' : 
                          element.type === 'range' ? 'input' : 'change';
        
        element.addEventListener(eventType, function() {
          // Récupérer les données actuelles
          const startTime = document.getElementById('start-time').value;
          const weeklyHours = parseFloat(document.getElementById('work-hours').value);
          const uniformEndTime = document.getElementById('uniform-end-time').checked;
          
          // Créer un objet pour stocker les données pour chaque jour
          const schedule = {
            monday: { 
              start: startTime, 
              lunch: parseInt(document.getElementById('monday-lunch').value),
              limit: document.getElementById('monday-limit').value || null
            },
            tuesday: { 
              start: startTime, 
              lunch: parseInt(document.getElementById('tuesday-lunch').value),
              limit: document.getElementById('tuesday-limit').value || null
            },
            wednesday: { 
              start: startTime, 
              lunch: parseInt(document.getElementById('wednesday-lunch').value),
              limit: document.getElementById('wednesday-limit').value || null
            },
            thursday: { 
              start: startTime, 
              lunch: parseInt(document.getElementById('thursday-lunch').value),
              limit: document.getElementById('thursday-limit').value || null
            },
            friday: { 
              start: startTime, 
              lunch: parseInt(document.getElementById('friday-lunch').value),
              limit: document.getElementById('friday-limit').value || null
            }
          };
          
          // Sauvegarder les données
          saveScheduleData({
            startTime,
            workHours: weeklyHours,
            uniformEndTime,
            schedule
          });
        });
      }
    });
  }

  // Initialiser les onglets
  initTabs();
  
  // Charger les données sauvegardées
  loadScheduleData();
  
  // Configurer la sauvegarde automatique
  setupAutoSave();

  // Gestionnaire d'événements pour le formulaire
  document.getElementById('schedule-form').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSchedule();
  });
  
  // Gestionnaire d'événements pour le bouton de réinitialisation
  document.getElementById('reset-button').addEventListener('click', function() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      clearScheduleData();
    }
  });
  
  // Sauvegarder les données avant la fermeture de l'extension
  window.addEventListener('beforeunload', function() {
    // Récupérer les données actuelles
    const startTime = document.getElementById('start-time').value;
    const weeklyHours = parseFloat(document.getElementById('work-hours').value);
    const uniformEndTime = document.getElementById('uniform-end-time').checked;
    
    // Créer un objet pour stocker les données pour chaque jour
    const schedule = {
      monday: { 
        start: startTime, 
        lunch: parseInt(document.getElementById('monday-lunch').value),
        limit: document.getElementById('monday-limit').value || null
      },
      tuesday: { 
        start: startTime, 
        lunch: parseInt(document.getElementById('tuesday-lunch').value),
        limit: document.getElementById('tuesday-limit').value || null
      },
      wednesday: { 
        start: startTime, 
        lunch: parseInt(document.getElementById('wednesday-lunch').value),
        limit: document.getElementById('wednesday-limit').value || null
      },
      thursday: { 
        start: startTime, 
        lunch: parseInt(document.getElementById('thursday-lunch').value),
        limit: document.getElementById('thursday-limit').value || null
      },
      friday: { 
        start: startTime, 
        lunch: parseInt(document.getElementById('friday-lunch').value),
        limit: document.getElementById('friday-limit').value || null
      }
    };
    
    // Sauvegarder les données
    saveScheduleData({
      startTime,
      workHours: weeklyHours,
      uniformEndTime,
      schedule
    });
  });
});

// Fonction pour calculer les horaires
function calculateSchedule() {
  // Récupérer les données du formulaire
  const startTime = document.getElementById('start-time').value;
  const weeklyHours = parseFloat(document.getElementById('work-hours').value);
  const uniformEndTime = document.getElementById('uniform-end-time').checked;
  
  // Créer un objet pour stocker les données pour chaque jour
  const schedule = {
    monday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('monday-lunch').value),
      limit: document.getElementById('monday-limit').value || null
    },
    tuesday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('tuesday-lunch').value),
      limit: document.getElementById('tuesday-limit').value || null
    },
    wednesday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('wednesday-lunch').value),
      limit: document.getElementById('wednesday-limit').value || null
    },
    thursday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('thursday-lunch').value),
      limit: document.getElementById('thursday-limit').value || null
    },
    friday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('friday-lunch').value),
      limit: document.getElementById('friday-limit').value || null
    }
  };
  
  // Définir l'indicateur balancedEnds en fonction de l'option uniformEndTime
  schedule.balancedEnds = uniformEndTime;
  
  // Calculer les heures de fin pour chaque jour
  if (uniformEndTime) {
    calculateUniformEndTimes(schedule, weeklyHours);
  } else {
    calculateEqualWorkHours(schedule, weeklyHours);
  }
  
  // Afficher les résultats
  displayResults(schedule);
  
  // Sauvegarder les données
  saveScheduleData({
    startTime,
    workHours: weeklyHours,
    uniformEndTime,
    schedule
  });
  
  // Activer l'onglet des résultats
  const resultsTabButton = document.querySelector('.tab-button[data-tab="results"]');
  if (resultsTabButton) {
    resultsTabButton.click();
  }
}

// Fonction pour calculer les horaires avec des heures de fin uniformes
function calculateUniformEndTimes(schedule, weeklyHours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const daysWithoutLimits = days.filter(day => !schedule[day].limit);
  
  // Calculer le nombre total de minutes à travailler par semaine
  const totalMinutesPerWeek = weeklyHours * 60;
  
  // Calculer les minutes déjà allouées aux jours avec des limites
  let allocatedMinutes = 0;
  days.forEach(day => {
    if (schedule[day].limit) {
      const startMinutes = timeToMinutes(schedule[day].start);
      const endMinutes = timeToMinutes(schedule[day].limit);
      const workMinutes = endMinutes - startMinutes - schedule[day].lunch;
      allocatedMinutes += workMinutes;
      
      // Mettre à jour l'heure de fin dans l'objet schedule
      schedule[day].end = schedule[day].limit;
      schedule[day].hours = (workMinutes / 60).toFixed(2);
    }
  });
  
  // Calculer les minutes restantes à répartir entre les jours sans limites
  const remainingMinutes = totalMinutesPerWeek - allocatedMinutes;
  
  if (daysWithoutLimits.length > 0) {
    // Déterminer une heure de fin commune pour tous les jours sans limites
    
    // Calculer l'heure de fin commune
    // D'abord, trouver l'heure de fin qui permettrait d'atteindre exactement le nombre d'heures requis
    // en tenant compte des différentes heures de début et pauses déjeuner
    
    // Calculer le temps de travail moyen par jour (en minutes)
    const avgWorkMinutesPerDay = remainingMinutes / daysWithoutLimits.length;
    
    // Trouver l'heure de fin commune qui permettrait d'atteindre ce temps de travail moyen
    // en tenant compte des différentes heures de début et pauses déjeuner
    let totalEndTimeMinutes = 0;
    
    daysWithoutLimits.forEach(day => {
      const startMinutes = timeToMinutes(schedule[day].start);
      const endMinutes = startMinutes + avgWorkMinutesPerDay + schedule[day].lunch;
      totalEndTimeMinutes += endMinutes;
    });
    
    // Calculer l'heure de fin moyenne
    const avgEndTimeMinutes = Math.round(totalEndTimeMinutes / daysWithoutLimits.length);
    const commonEndTime = minutesToTime(avgEndTimeMinutes);
    
    // Appliquer cette heure de fin commune à tous les jours sans limites
    let totalWorkMinutes = 0;
    
    daysWithoutLimits.forEach(day => {
      const startMinutes = timeToMinutes(schedule[day].start);
      const endMinutes = timeToMinutes(commonEndTime);
      const workMinutes = endMinutes - startMinutes - schedule[day].lunch;
      
      schedule[day].end = commonEndTime;
      schedule[day].hours = (workMinutes / 60).toFixed(2);
      
      totalWorkMinutes += workMinutes;
    });
    
    // Vérifier si le total des heures correspond à ce qui est demandé
    // Si ce n'est pas le cas, ajuster légèrement l'heure de fin du dernier jour
    const targetRemainingMinutes = remainingMinutes;
    const diffMinutes = targetRemainingMinutes - totalWorkMinutes;
    
    if (Math.abs(diffMinutes) > 0) {
      // Ajuster l'heure de fin du dernier jour pour compenser la différence
      const lastDay = daysWithoutLimits[daysWithoutLimits.length - 1];
      const lastDayEndMinutes = timeToMinutes(schedule[lastDay].end) + diffMinutes;
      schedule[lastDay].end = minutesToTime(lastDayEndMinutes);
      
      // Recalculer les heures de travail pour ce jour
      const startMinutes = timeToMinutes(schedule[lastDay].start);
      const endMinutes = lastDayEndMinutes;
      const workMinutes = endMinutes - startMinutes - schedule[lastDay].lunch;
      schedule[lastDay].hours = (workMinutes / 60).toFixed(2);
    }
  }
  
  // Calculer le total des heures travaillées
  let totalHours = 0;
  days.forEach(day => {
    totalHours += parseFloat(schedule[day].hours);
  });
  
  schedule.totalHours = totalHours.toFixed(2);
  schedule.targetHours = weeklyHours.toFixed(2);
  schedule.hoursMatch = Math.abs(totalHours - weeklyHours) < 0.01;
}

// Fonction pour calculer les horaires avec des heures de travail égales
function calculateEqualWorkHours(schedule, weeklyHours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const daysWithoutLimits = days.filter(day => !schedule[day].limit);
  
  // Calculer le nombre total de minutes à travailler par semaine
  const totalMinutesPerWeek = weeklyHours * 60;
  
  // Calculer les minutes déjà allouées aux jours avec des limites
  let allocatedMinutes = 0;
  days.forEach(day => {
    if (schedule[day].limit) {
      const startMinutes = timeToMinutes(schedule[day].start);
      const endMinutes = timeToMinutes(schedule[day].limit);
      const workMinutes = endMinutes - startMinutes - schedule[day].lunch;
      allocatedMinutes += workMinutes;
      
      // Mettre à jour l'heure de fin dans l'objet schedule
      schedule[day].end = schedule[day].limit;
      schedule[day].hours = (workMinutes / 60).toFixed(2);
    }
  });
  
  // Calculer les minutes restantes à répartir entre les jours sans limites
  const remainingMinutes = totalMinutesPerWeek - allocatedMinutes;
  
  if (daysWithoutLimits.length > 0) {
    // Calculer les minutes par jour pour les jours sans limites
    const minutesPerDay = Math.floor(remainingMinutes / daysWithoutLimits.length);
    // Calculer les minutes restantes après distribution égale
    let extraMinutes = remainingMinutes - (minutesPerDay * daysWithoutLimits.length);
    
    // Appliquer les heures de travail égales à tous les jours sans limites
    daysWithoutLimits.forEach((day, index) => {
      const startMinutes = timeToMinutes(schedule[day].start);
      // Ajouter une minute supplémentaire aux premiers jours si nécessaire pour atteindre exactement le total d'heures
      const additionalMinute = (index < extraMinutes) ? 1 : 0;
      let workMinutes = minutesPerDay + additionalMinute;
      
      const endMinutes = startMinutes + workMinutes + schedule[day].lunch;
      
      schedule[day].end = minutesToTime(endMinutes);
      schedule[day].hours = (workMinutes / 60).toFixed(2);
    });
  }
  
  // Calculer le total des heures travaillées
  let totalHours = 0;
  days.forEach(day => {
    if (!schedule[day].hours) {
      schedule[day].hours = "0.00";
    }
    totalHours += parseFloat(schedule[day].hours);
  });
  
  schedule.totalHours = totalHours.toFixed(2);
  schedule.targetHours = (weeklyHours).toFixed(2);
  schedule.hoursMatch = Math.abs(totalHours - weeklyHours) < 0.01;
}

// Fonction pour calculer les horaires restants de la semaine
function calculateRemainingSchedule() {
  console.log('Début de calculateRemainingSchedule');
  
  // Récupérer les données du formulaire de configuration
  const startTime = document.getElementById('start-time').value;
  console.log('Heure de début:', startTime);
  
  const weeklyHours = parseFloat(document.getElementById('work-hours').value);
  console.log('Heures hebdomadaires:', weeklyHours);
  
  const uniformEndTime = document.getElementById('uniform-end-time').checked;
  console.log('Heure de fin uniforme:', uniformEndTime);
  
  // Récupérer les données du formulaire d'ajustement
  const currentDate = new Date(document.getElementById('current-date').value);
  console.log('Date actuelle:', currentDate);
  
  const currentTime = document.getElementById('current-time').value;
  console.log('Heure actuelle:', currentTime);
  
  const hoursWorked = parseInt(document.getElementById('hours-worked').value || 0);
  console.log('Heures travaillées:', hoursWorked);
  
  const minutesWorked = parseInt(document.getElementById('minutes-worked').value || 0);
  console.log('Minutes travaillées:', minutesWorked);
  
  const continueToday = document.getElementById('continue-today').checked;
  console.log('Continuer aujourd\'hui:', continueToday);
  
  const todayLimit = document.getElementById('today-limit').value;
  console.log('Limite aujourd\'hui:', todayLimit);
  
  // Récupérer l'état de la case à cocher "Pause déjeuner déjà prise"
  const lunchTaken = document.getElementById('lunch-taken').checked;
  console.log('Pause déjeuner déjà prise:', lunchTaken);
  
  // Calculer le nombre total de minutes travaillées cette semaine
  const totalMinutesWorked = hoursWorked * 60 + minutesWorked;
  console.log('Total minutes travaillées:', totalMinutesWorked);
  
  // Déterminer le jour de la semaine actuel (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const currentDayIndex = currentDate.getDay();
  const currentDayName = getDayNameFromIndex(currentDayIndex);
  console.log('Jour actuel:', currentDayIndex, currentDayName);
  
  // Créer un objet pour stocker les données pour chaque jour
  const schedule = {
    monday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('monday-lunch').value),
      limit: document.getElementById('monday-limit').value || null,
      past: currentDayIndex > 1 // Si on est après lundi
    },
    tuesday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('tuesday-lunch').value),
      limit: document.getElementById('tuesday-limit').value || null,
      past: currentDayIndex > 2 // Si on est après mardi
    },
    wednesday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('wednesday-lunch').value),
      limit: document.getElementById('wednesday-limit').value || null,
      past: currentDayIndex > 3 // Si on est après mercredi
    },
    thursday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('thursday-lunch').value),
      limit: document.getElementById('thursday-limit').value || null,
      past: currentDayIndex > 4 // Si on est après jeudi
    },
    friday: { 
      start: startTime, 
      lunch: parseInt(document.getElementById('friday-lunch').value),
      limit: document.getElementById('friday-limit').value || null,
      past: currentDayIndex > 5 // Si on est après vendredi
    },
    // Stocker les heures déjà travaillées pour les utiliser dans l'affichage
    hoursAlreadyWorked: hoursWorked,
    minutesAlreadyWorked: minutesWorked,
    totalMinutesWorked: totalMinutesWorked
  };
  
  // Marquer le jour actuel
  if (currentDayName && schedule[currentDayName]) {
    schedule[currentDayName].isCurrent = true;
    
    // Si on ne continue pas à travailler aujourd'hui, marquer comme terminé
    if (!continueToday) {
      schedule[currentDayName].isFinished = true;
    } 
    // Sinon, si on a une limite pour aujourd'hui, l'utiliser
    else if (todayLimit) {
      schedule[currentDayName].limit = todayLimit;
    }
    
    // Si la pause déjeuner a déjà été prise, marquer cette information
    if (lunchTaken) {
      schedule[currentDayName].lunchTaken = true;
    }
  }
  
  // Calculer les minutes restantes à travailler cette semaine
  const totalMinutesPerWeek = weeklyHours * 60;
  const remainingMinutes = totalMinutesPerWeek - totalMinutesWorked;
  
  // Définir l'indicateur balancedEnds en fonction de l'option uniformEndTime
  schedule.balancedEnds = uniformEndTime;
  
  // Calculer les horaires restants
  if (uniformEndTime) {
    console.log('Calcul avec heures de fin uniformes, weeklyHours =', weeklyHours);
    calculateRemainingUniformEndTimes(schedule, remainingMinutes, currentDayName, continueToday, weeklyHours, lunchTaken);
  } else {
    console.log('Calcul avec heures de travail égales, weeklyHours =', weeklyHours);
    calculateRemainingEqualWorkHours(schedule, remainingMinutes, currentDayName, continueToday, weeklyHours, lunchTaken);
  }
  
  // Afficher les résultats
  displayResults(schedule);
  
  // Sauvegarder les données
  saveScheduleData({
    startTime,
    workHours: weeklyHours,
    uniformEndTime,
    schedule
  });
  
  // Activer l'onglet des résultats
  const resultsTabButton = document.querySelector('.tab-button[data-tab="results"]');
  if (resultsTabButton) {
    resultsTabButton.click();
  }
  
  // Afficher également un résumé dans l'onglet d'ajustement
  displayAdjustmentSummary(schedule, weeklyHours, totalMinutesWorked, remainingMinutes);
}

// Fonction pour calculer les horaires restants avec des heures de fin uniformes
function calculateRemainingUniformEndTimes(schedule, remainingMinutes, currentDayName, continueToday, weeklyHours, lunchTaken) {
  console.log('Début de calculateRemainingUniformEndTimes avec weeklyHours =', weeklyHours);
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  // Filtrer les jours à traiter (jours restants)
  const remainingDays = days.filter(day => {
    // Exclure les jours passés
    if (schedule[day].past) return false;
    // Exclure le jour actuel s'il est terminé
    if (day === currentDayName && schedule[day].isFinished) return false;
    // Inclure tous les autres jours
    return true;
  });
  
  // Si on continue aujourd'hui, utiliser l'heure actuelle comme heure de début pour le jour actuel
  if (continueToday && currentDayName && schedule[currentDayName]) {
    // Récupérer l'heure actuelle du formulaire
    const currentTime = document.getElementById('current-time').value;
    if (currentTime) {
      // Utiliser l'heure actuelle comme heure de début pour le calcul du jour actuel
      schedule[currentDayName].currentTime = currentTime;
      console.log(`Utilisation de l'heure actuelle (${currentTime}) comme point de départ pour ${currentDayName}`);
    }
  }
  
  // Calculer les minutes déjà allouées aux jours avec des limites
  let allocatedMinutes = 0;
  remainingDays.forEach(day => {
    if (schedule[day].limit) {
      // Pour le jour actuel, utiliser l'heure actuelle comme point de départ si disponible
      const startTime = (day === currentDayName && schedule[day].currentTime) ? schedule[day].currentTime : schedule[day].start;
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(schedule[day].limit);
      
      // Déterminer si la pause déjeuner doit être prise en compte pour ce jour
      let lunchMinutes = schedule[day].lunch;
      if (day === currentDayName && schedule[day].lunchTaken) {
        // Si la pause déjeuner a déjà été prise pour le jour actuel, ne pas la compter
        lunchMinutes = 0;
        console.log(`Pause déjeuner déjà prise pour ${day}, ne pas la compter dans le calcul`);
      }
      
      const workMinutes = endMinutes - startMinutes - lunchMinutes;
      
      allocatedMinutes += workMinutes > 0 ? workMinutes : 0;
      
      // Mettre à jour l'heure de fin dans l'objet schedule
      schedule[day].end = schedule[day].limit;
      schedule[day].hours = (workMinutes / 60).toFixed(2);
    }
  });
  
  // Calculer les minutes restantes à répartir entre les jours sans limites
  const unallocatedMinutes = remainingMinutes - allocatedMinutes;
  const daysWithoutLimits = remainingDays.filter(day => !schedule[day].limit);
  
  if (daysWithoutLimits.length > 0) {
    // Déterminer une heure de fin commune pour tous les jours sans limites
    const avgWorkMinutesPerDay = unallocatedMinutes / daysWithoutLimits.length;
    
    // Trouver l'heure de fin commune qui permettrait d'atteindre ce temps de travail moyen
    let totalEndTimeMinutes = 0;
    
    daysWithoutLimits.forEach(day => {
      // Pour le jour actuel, utiliser l'heure actuelle comme point de départ si disponible
      const startTime = (day === currentDayName && schedule[day].currentTime) ? schedule[day].currentTime : schedule[day].start;
      const startMinutes = timeToMinutes(startTime);
      
      // Déterminer si la pause déjeuner doit être prise en compte pour ce jour
      let lunchMinutes = schedule[day].lunch;
      if (day === currentDayName && schedule[day].lunchTaken) {
        // Si la pause déjeuner a déjà été prise pour le jour actuel, ne pas la compter
        lunchMinutes = 0;
      }
      
      const endMinutes = startMinutes + avgWorkMinutesPerDay + lunchMinutes;
      totalEndTimeMinutes += endMinutes;
    });
    
    // Calculer l'heure de fin moyenne
    const avgEndTimeMinutes = Math.round(totalEndTimeMinutes / daysWithoutLimits.length);
    const commonEndTime = minutesToTime(avgEndTimeMinutes);
    
    // Appliquer cette heure de fin commune à tous les jours sans limites
    let totalWorkMinutes = 0;
    
    daysWithoutLimits.forEach(day => {
      // Pour le jour actuel, utiliser l'heure actuelle comme point de départ si disponible
      const startTime = (day === currentDayName && schedule[day].currentTime) ? schedule[day].currentTime : schedule[day].start;
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(commonEndTime);
      
      // Déterminer si la pause déjeuner doit être prise en compte pour ce jour
      let lunchMinutes = schedule[day].lunch;
      if (day === currentDayName && schedule[day].lunchTaken) {
        // Si la pause déjeuner a déjà été prise pour le jour actuel, ne pas la compter
        lunchMinutes = 0;
      }
      
      // Calculer les minutes de travail pour ce jour
      const workMinutes = endMinutes - startMinutes - lunchMinutes;
      
      schedule[day].end = commonEndTime;
      schedule[day].hours = (workMinutes / 60).toFixed(2);
      
      totalWorkMinutes += workMinutes;
    });
    
    // Ajuster si nécessaire pour atteindre exactement le nombre d'heures requis
    const diffMinutes = unallocatedMinutes - totalWorkMinutes;
    
    if (Math.abs(diffMinutes) > 1) {
      // Ajuster l'heure de fin du dernier jour non passé et sans limite
      const lastDay = daysWithoutLimits[daysWithoutLimits.length - 1];
      const lastDayEndMinutes = timeToMinutes(schedule[lastDay].end) + diffMinutes;
      schedule[lastDay].end = minutesToTime(lastDayEndMinutes);
      
      // Recalculer les heures de travail pour ce jour
      const startMinutes = timeToMinutes(schedule[lastDay].start);
      const endMinutes = lastDayEndMinutes;
      const workMinutes = endMinutes - startMinutes - schedule[lastDay].lunch;
      
      schedule[lastDay].hours = (workMinutes / 60).toFixed(2);
    }
  }
  
  // Calculer le total des heures travaillées
  let totalHours = 0;
  days.forEach(day => {
    if (!schedule[day].hours) {
      schedule[day].hours = "0.00";
    }
    totalHours += parseFloat(schedule[day].hours);
  });
  
  schedule.totalHours = totalHours.toFixed(2);
  schedule.targetHours = (weeklyHours).toFixed(2);
  schedule.hoursMatch = Math.abs(totalHours - weeklyHours) < 0.01;
}

// Fonction pour calculer les horaires restants avec des heures de travail égales
function calculateRemainingEqualWorkHours(schedule, remainingMinutes, currentDayName, continueToday, weeklyHours, lunchTaken) {
  console.log('Début de calculateRemainingEqualWorkHours avec weeklyHours =', weeklyHours);
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  // Filtrer les jours à traiter (jours restants)
  const remainingDays = days.filter(day => {
    // Exclure les jours passés
    if (schedule[day].past) return false;
    // Exclure le jour actuel s'il est terminé
    if (day === currentDayName && schedule[day].isFinished) return false;
    // Inclure tous les autres jours
    return true;
  });
  
  // Si on continue aujourd'hui, utiliser l'heure actuelle comme heure de début pour le jour actuel
  if (continueToday && currentDayName && schedule[currentDayName]) {
    // Récupérer l'heure actuelle du formulaire
    const currentTime = document.getElementById('current-time').value;
    if (currentTime) {
      // Utiliser l'heure actuelle comme heure de début pour le calcul du jour actuel
      schedule[currentDayName].currentTime = currentTime;
      console.log(`Utilisation de l'heure actuelle (${currentTime}) comme point de départ pour ${currentDayName}`);
    }
  }
  
  // Calculer les minutes déjà allouées aux jours avec des limites
  let allocatedMinutes = 0;
  remainingDays.forEach(day => {
    if (schedule[day].limit) {
      // Pour le jour actuel, utiliser l'heure actuelle comme point de départ si disponible
      const startTime = (day === currentDayName && schedule[day].currentTime) ? schedule[day].currentTime : schedule[day].start;
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(schedule[day].limit);
      
      // Déterminer si la pause déjeuner doit être prise en compte pour ce jour
      let lunchMinutes = schedule[day].lunch;
      if (day === currentDayName && schedule[day].lunchTaken) {
        // Si la pause déjeuner a déjà été prise pour le jour actuel, ne pas la compter
        lunchMinutes = 0;
        console.log(`Pause déjeuner déjà prise pour ${day}, ne pas la compter dans le calcul`);
      }
      
      const workMinutes = endMinutes - startMinutes - lunchMinutes;
      
      allocatedMinutes += workMinutes > 0 ? workMinutes : 0;
      
      // Mettre à jour l'heure de fin dans l'objet schedule
      schedule[day].end = schedule[day].limit;
      schedule[day].hours = (workMinutes / 60).toFixed(2);
    }
  });
  
  // Calculer les minutes restantes à répartir entre les jours sans limites
  const unallocatedMinutes = remainingMinutes - allocatedMinutes;
  const daysWithoutLimits = remainingDays.filter(day => !schedule[day].limit);
  
  if (daysWithoutLimits.length > 0) {
    // Calculer les minutes par jour pour les jours sans limites
    const minutesPerDay = Math.floor(unallocatedMinutes / daysWithoutLimits.length);
    // Calculer les minutes restantes après distribution égale
    let extraMinutes = unallocatedMinutes - (minutesPerDay * daysWithoutLimits.length);
    
    // Appliquer les heures de travail égales à tous les jours sans limites
    daysWithoutLimits.forEach((day, index) => {
      // Pour le jour actuel, utiliser l'heure actuelle comme point de départ si disponible
      const startTime = (day === currentDayName && schedule[day].currentTime) ? schedule[day].currentTime : schedule[day].start;
      const startMinutes = timeToMinutes(startTime);
      // Ajouter une minute supplémentaire aux premiers jours si nécessaire pour atteindre exactement le total d'heures
      const additionalMinute = (index < extraMinutes) ? 1 : 0;
      const workMinutes = minutesPerDay + additionalMinute;
      
      // Déterminer si la pause déjeuner doit être prise en compte pour ce jour
      let lunchMinutes = schedule[day].lunch;
      if (day === currentDayName && schedule[day].lunchTaken) {
        // Si la pause déjeuner a déjà été prise pour le jour actuel, ne pas la compter
        lunchMinutes = 0;
      }
      
      const endMinutes = startMinutes + workMinutes + lunchMinutes;
      
      schedule[day].end = minutesToTime(endMinutes);
      schedule[day].hours = (workMinutes / 60).toFixed(2);
    });
  }
  
  // Calculer le total des heures travaillées
  let totalHours = 0;
  days.forEach(day => {
    if (!schedule[day].hours) {
      schedule[day].hours = "0.00";
    }
    totalHours += parseFloat(schedule[day].hours);
  });
  
  schedule.totalHours = totalHours.toFixed(2);
  schedule.targetHours = (weeklyHours).toFixed(2);
  schedule.hoursMatch = Math.abs(totalHours - weeklyHours) < 0.01;
}

// Fonction utilitaire pour convertir l'index du jour en nom de jour
function getDayNameFromIndex(dayIndex) {
  switch (dayIndex) {
    case 1: return 'monday';
    case 2: return 'tuesday';
    case 3: return 'wednesday';
    case 4: return 'thursday';
    case 5: return 'friday';
    default: return null; // Weekend
  }
}

// Fonction utilitaire pour calculer les minutes travaillées pour un jour donné
function getWorkingMinutesForDay(dayData) {
  if (dayData.past && dayData.end) {
    const startMinutes = timeToMinutes(dayData.start);
    const endMinutes = timeToMinutes(dayData.end);
    return endMinutes - startMinutes - dayData.lunch;
  }
  return 0;
}

// Fonction pour afficher un résumé dans l'onglet d'ajustement
function displayAdjustmentSummary(schedule, weeklyHours, weeklyMinutesWorked, remainingMinutes) {
  const adjustmentResult = document.getElementById('adjustment-result');
  
  // S'assurer que weeklyMinutesWorked est défini
  weeklyMinutesWorked = weeklyMinutesWorked || 0;
  
  const hoursWorked = (weeklyMinutesWorked / 60).toFixed(2);
  const remainingHours = (remainingMinutes / 60).toFixed(2);
  const percentComplete = Math.round((weeklyMinutesWorked / (weeklyHours * 60)) * 100);
  
  // Déterminer le jour actuel
  const today = new Date();
  const currentDayIndex = today.getDay();
  const currentDayName = getDayNameFromIndex(currentDayIndex);
  const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const currentDayLabel = daysOfWeek[currentDayIndex];
  
  // Déterminer les jours restants dans la semaine
  const remainingDaysCount = 5 - Object.values(schedule).filter(day => day.past || (day.isCurrent && day.isFinished)).length;
  
  // Calculer le total des heures (déjà travaillées + calculées)
  const calculatedHours = parseFloat(schedule.totalHours);
  const totalHours = (calculatedHours + (weeklyMinutesWorked / 60)).toFixed(2);
  const totalHoursMatch = Math.abs(parseFloat(totalHours) - weeklyHours) < 0.01;
  
  const summary = `
    <div class="space-y-4">
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Résumé de la semaine</h3>
        
        ${weeklyMinutesWorked > 0 ? `
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">Heures déjà travaillées :</span>
          <span class="font-medium text-blue-600">${hoursWorked}h</span>
        </div>
        ` : ''}
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">Heures calculées :</span>
          <span class="font-medium text-indigo-600">${calculatedHours.toFixed(2)}h</span>
        </div>
        
        <div class="flex items-center justify-between mb-2 pt-2 border-t border-gray-100">
          <span class="text-sm font-medium text-gray-700">Total des heures :</span>
          <span class="font-medium ${totalHoursMatch ? 'text-green-600' : 'text-yellow-600'}">${totalHours}h / ${weeklyHours}h</span>
        </div>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">Heures restantes :</span>
          <span class="font-medium text-indigo-600">${remainingHours}h</span>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-3">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${percentComplete}%"></div>
        </div>
        
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>0h</span>
          <span>${weeklyHours}h</span>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div class="flex items-center mb-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <i class="fas fa-calendar-day text-blue-600"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Aujourd'hui - ${currentDayLabel}</h3>
        </div>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">Statut :</span>
          <span class="px-2 py-1 text-xs font-medium rounded-full ${schedule[currentDayName]?.isFinished ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}">
            ${schedule[currentDayName]?.isFinished ? 'Terminé pour aujourd\'hui' : 'En cours'}
          </span>
        </div>
        
        ${schedule[currentDayName] && !schedule[currentDayName].isFinished ? `
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">Heure de fin estimée :</span>
          <span class="font-medium text-indigo-600">${schedule[currentDayName].end || 'N/A'}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div class="flex items-center mb-3">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <i class="fas fa-calendar-week text-indigo-600"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Jours restants</h3>
        </div>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">Jours à travailler :</span>
          <span class="font-medium text-indigo-600">${remainingDaysCount} jour${remainingDaysCount > 1 ? 's' : ''}</span>
        </div>
        
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">Heures par jour (moy.) :</span>
          <span class="font-medium text-indigo-600">${remainingDaysCount > 0 ? (remainingMinutes / 60 / remainingDaysCount).toFixed(2) : '0.00'}h</span>
        </div>
        
        <p class="text-sm text-gray-600 mt-2">
          <i class="fas fa-info-circle mr-1 text-blue-500"></i>
          Consultez l'onglet "Résultats" pour voir le détail des horaires calculés.
        </p>
      </div>
    </div>
  `;
  
  adjustmentResult.innerHTML = summary;
}

// Fonction pour afficher les résultats
function displayResults(schedule) {
  const resultsContainer = document.getElementById('schedule-results');
  resultsContainer.innerHTML = '';
  
  // Créer un message de confirmation
  const confirmationMessage = document.createElement('div');
  confirmationMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Horaires calculés avec succès !';
  confirmationMessage.classList.add('notification', 'success', 'mb-3');
  resultsContainer.appendChild(confirmationMessage);
  
  // Créer le tableau des résultats
  const table = document.createElement('table');
  table.classList.add('results-table', 'w-full', 'border-collapse');
  
  // Créer l'en-tête du tableau
  const thead = document.createElement('thead');
  thead.classList.add('bg-gray-50');
  const headerRow = document.createElement('tr');
  
  const headers = ['Jour', 'Début', 'Déjeuner', 'Fin', 'Heures'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    th.classList.add('px-2', 'py-1', 'text-left', 'text-xs', 'font-medium', 'text-gray-700');
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Créer le corps du tableau
  const tbody = document.createElement('tbody');
  tbody.classList.add('divide-y', 'divide-gray-200');
  
  const days = [
    { key: 'monday', label: 'Lundi', icon: 'calendar-day' },
    { key: 'tuesday', label: 'Mardi', icon: 'calendar-day' },
    { key: 'wednesday', label: 'Mercredi', icon: 'calendar-day' },
    { key: 'thursday', label: 'Jeudi', icon: 'calendar-day' },
    { key: 'friday', label: 'Vendredi', icon: 'calendar-day' }
  ];
  
  days.forEach(day => {
    const tr = document.createElement('tr');
    tr.classList.add('hover:bg-gray-50');
    
    // Déterminer si le jour doit être grisé (jour passé ou jour actuel fini)
    const isGrayed = schedule[day.key].past || 
                     (schedule[day.key].isCurrent && schedule[day.key].isFinished);
    
    if (isGrayed) {
      tr.classList.add('text-gray-400', 'bg-gray-100');
    }
    
    // Si c'est le jour actuel et qu'il n'est pas terminé, le mettre en évidence
    if (schedule[day.key].isCurrent && !schedule[day.key].isFinished) {
      tr.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
    }
    
    // Jour
    const tdDay = document.createElement('td');
    let dayLabel = day.label;
    
    // Ajouter un indicateur pour le jour actuel
    if (schedule[day.key].isCurrent) {
      if (!schedule[day.key].isFinished) {
        tdDay.innerHTML = `
          <div class="flex items-center">
            <i class="fas fa-${day.icon} mr-2 text-blue-500"></i>
            <div>
              <span class="font-medium">${dayLabel}</span>
              <span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Aujourd'hui</span>
            </div>
          </div>
        `;
      } else {
        tdDay.innerHTML = `
          <div class="flex items-center">
            <i class="fas fa-${day.icon} mr-2 text-gray-400"></i>
            <div>
              <span class="font-medium">${dayLabel}</span>
              <span class="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Terminé</span>
            </div>
          </div>
        `;
      }
    } else if (schedule[day.key].past) {
      tdDay.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-${day.icon} mr-2 text-gray-400"></i>
          <div>
            <span class="font-medium">${dayLabel}</span>
            <span class="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Passé</span>
          </div>
        </div>
      `;
    } else {
      tdDay.innerHTML = `<div class="flex items-center"><i class="fas fa-${day.icon} mr-2 text-blue-500"></i><span class="font-medium">${dayLabel}</span></div>`;
    }
    
    tdDay.classList.add('px-2', 'py-2');
    tr.appendChild(tdDay);
    
    // Heure de début
    const tdStart = document.createElement('td');
    tdStart.innerHTML = `<span class="${isGrayed ? 'text-gray-400' : 'text-gray-800'}">${schedule[day.key].start}</span>`;
    tdStart.classList.add('px-2', 'py-2');
    tr.appendChild(tdStart);
    
    // Pause déjeuner
    const tdLunch = document.createElement('td');
    tdLunch.innerHTML = `<span class="${isGrayed ? 'badge badge-gray' : 'badge badge-blue'}">${schedule[day.key].lunch} min</span>`;
    tdLunch.classList.add('px-2', 'py-2');
    tr.appendChild(tdLunch);
    
    // Heure de fin
    const tdEnd = document.createElement('td');
    tdEnd.classList.add('px-2', 'py-2');
    
    // Si le jour est passé ou terminé, on affiche l'heure de fin différemment
    if (isGrayed) {
      tdEnd.innerHTML = `<span class="text-gray-400">${schedule[day.key].end || 'N/A'}</span>`;
    } 
    // Ajouter une classe si l'heure de fin correspond à une limite
    else if (schedule[day.key].limit && schedule[day.key].end === schedule[day.key].limit) {
      tdEnd.innerHTML = `<span class="badge badge-red">${schedule[day.key].end}</span>`;
    } 
    // Ajouter une classe si les heures de fin sont équilibrées
    else if (schedule.balancedEnds && !schedule[day.key].limit) {
      tdEnd.innerHTML = `<span class="badge badge-green">${schedule[day.key].end}</span>`;
    }
    else {
      tdEnd.innerHTML = `<span class="text-gray-800">${schedule[day.key].end}</span>`;
    }
    
    tr.appendChild(tdEnd);
    
    // Heures travaillées
    const tdHours = document.createElement('td');
    tdHours.innerHTML = `<span class="font-medium ${isGrayed ? 'text-gray-400' : ''}">${schedule[day.key].hours}h</span>`;
    tdHours.classList.add('px-2', 'py-2');
    tr.appendChild(tdHours);
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  resultsContainer.appendChild(table);
  
  // Créer le résumé
  const summary = document.createElement('div');
  summary.classList.add('bg-blue-50', 'p-4', 'rounded-lg', 'mt-4', 'border', 'border-blue-100');
  
  // S'assurer que totalMinutesWorked est défini
  const totalMinutesWorked = schedule.totalMinutesWorked || 0;
  
  // Heures déjà travaillées
  if (totalMinutesWorked > 0) {
    const hoursAlreadyWorkedElement = document.createElement('p');
    const hoursAlreadyWorked = (totalMinutesWorked / 60).toFixed(2);
    hoursAlreadyWorkedElement.innerHTML = `<div class="flex items-center"><i class="fas fa-history text-blue-500 mr-2"></i><strong>Heures déjà travaillées:</strong> <span class="ml-2 font-bold text-blue-600">${hoursAlreadyWorked}h</span></div>`;
    summary.appendChild(hoursAlreadyWorkedElement);
  }
  
  // Heures calculées pour les jours restants
  const calculatedHoursElement = document.createElement('p');
  calculatedHoursElement.innerHTML = `<div class="flex items-center mt-2"><i class="fas fa-calculator text-indigo-500 mr-2"></i><strong>Heures calculées:</strong> <span class="ml-2 font-bold text-indigo-600">${schedule.totalHours}h</span></div>`;
  summary.appendChild(calculatedHoursElement);
  
  // Total des heures (déjà travaillées + calculées)
  const totalHoursElement = document.createElement('p');
  const totalHours = (parseFloat(schedule.totalHours) + (totalMinutesWorked / 60)).toFixed(2);
  
  // Ajouter une classe si le total correspond à l'objectif
  if (Math.abs(totalHours - schedule.targetHours) < 0.01) {
    totalHoursElement.innerHTML = `<div class="flex items-center mt-3 pt-3 border-t border-blue-200"><i class="fas fa-check-circle text-green-500 mr-2"></i><strong>Total des heures:</strong> <span class="ml-2 font-bold text-green-600">${totalHours}h / ${schedule.targetHours}h</span></div>`;
  } else {
    totalHoursElement.innerHTML = `<div class="flex items-center mt-3 pt-3 border-t border-blue-200"><i class="fas fa-exclamation-circle text-yellow-500 mr-2"></i><strong>Total des heures:</strong> <span class="ml-2 font-bold text-yellow-600">${totalHours}h / ${schedule.targetHours}h</span></div>`;
  }
  
  summary.appendChild(totalHoursElement);
  
  // Moyenne par jour
  const avgHours = (parseFloat(schedule.totalHours) / 5).toFixed(2);
  const avgHoursElement = document.createElement('p');
  avgHoursElement.innerHTML = `<div class="flex items-center mt-2"><i class="fas fa-calculator text-blue-500 mr-2"></i><strong>Moyenne par jour:</strong> <span class="ml-2 font-medium">${avgHours}h</span></div>`;
  summary.appendChild(avgHoursElement);
  
  // Statut des heures de fin équilibrées
  const balancedEndsElement = document.createElement('p');
  if (schedule.balancedEnds) {
    balancedEndsElement.innerHTML = `<div class="flex items-center mt-2"><i class="fas fa-equals text-green-500 mr-2"></i><strong>Fins équilibrées:</strong> <span class="ml-2 font-medium text-green-600">Oui</span></div>`;
  } else {
    balancedEndsElement.innerHTML = `<div class="flex items-center mt-2"><i class="fas fa-not-equal text-yellow-500 mr-2"></i><strong>Fins équilibrées:</strong> <span class="ml-2 font-medium text-yellow-600">Non</span></div>`;
  }
  summary.appendChild(balancedEndsElement);
  
  resultsContainer.appendChild(summary);
  
  // Afficher le conteneur de résultats
  resultsContainer.style.display = 'block';
}

// Fonction pour sauvegarder les données
function saveScheduleData(data) {
  // Déterminer l'API de stockage à utiliser (chrome ou browser)
  const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
  
  // Sauvegarder dans storage.sync
  storage.sync.set({
    'schedule': data.schedule,
    'uniformEndTime': data.uniformEndTime,
    'workHours': data.workHours,
    'startTime': data.startTime
  }).then(() => {
    console.log('Données sauvegardées dans storage.sync');
  }).catch(error => {
    console.error('Erreur lors de la sauvegarde dans storage.sync:', error);
  });
  
  // Sauvegarder également dans storage.local pour plus de fiabilité
  storage.local.set({
    'schedule': data.schedule,
    'uniformEndTime': data.uniformEndTime,
    'workHours': data.workHours,
    'startTime': data.startTime
  }).then(() => {
    console.log('Données sauvegardées dans storage.local');
  }).catch(error => {
    console.error('Erreur lors de la sauvegarde dans storage.local:', error);
  });
}

// Fonction pour charger les données sauvegardées
function loadScheduleData() {
  // Déterminer l'API de stockage à utiliser (chrome ou browser)
  const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
  
  // Essayer d'abord storage.local
  storage.local.get(['schedule', 'uniformEndTime', 'workHours', 'startTime'])
    .then(localData => {
      if (localData.schedule) {
        console.log('Données chargées depuis storage.local');
        applyLoadedData(localData);
      } else {
        // Si pas de données dans local, essayer sync
        return storage.sync.get(['schedule', 'uniformEndTime', 'workHours', 'startTime']);
      }
    })
    .then(syncData => {
      if (syncData && syncData.schedule) {
        console.log('Données chargées depuis storage.sync');
        applyLoadedData(syncData);
      }
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données:', error);
      
      // Fallback pour Chrome qui utilise des callbacks au lieu de Promises
      if (typeof chrome !== 'undefined') {
        chrome.storage.local.get(['schedule', 'uniformEndTime', 'workHours', 'startTime'], function(localData) {
          if (localData.schedule) {
            console.log('Données chargées depuis chrome.storage.local (fallback)');
            applyLoadedData(localData);
          } else {
            // Si pas de données dans local, essayer sync
            chrome.storage.sync.get(['schedule', 'uniformEndTime', 'workHours', 'startTime'], function(syncData) {
              if (syncData.schedule) {
                console.log('Données chargées depuis chrome.storage.sync (fallback)');
                applyLoadedData(syncData);
              }
            });
          }
        });
      }
    });
}

// Fonction pour appliquer les données chargées
function applyLoadedData(data) {
  if (data.uniformEndTime) {
    document.getElementById('uniform-end-time').checked = data.uniformEndTime;
  }
  
  if (data.workHours) {
    document.getElementById('work-hours').value = data.workHours;
  }
  
  if (data.startTime) {
    document.getElementById('start-time').value = data.startTime;
  }
  
  if (data.schedule) {
    // Définir les pauses déjeuner et les limites pour chaque jour
    Object.entries(data.schedule).forEach(([day, times]) => {
      const lunchSlider = document.getElementById(`${day}-lunch`);
      if (lunchSlider) {
        lunchSlider.value = times.lunch;
        document.getElementById(`${day}-lunch-value`).textContent = times.lunch;
      }
      
      if (times.limit) {
        const limitInput = document.getElementById(`${day}-limit`);
        if (limitInput) {
          limitInput.value = times.limit;
        }
      }
    });
    
    // Afficher les résultats sauvegardés
    displayResults(data.schedule);
  }
}

// Fonction pour effacer les données sauvegardées
function clearScheduleData() {
  // Déterminer l'API de stockage à utiliser (chrome ou browser)
  const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
  
  // Effacer les données de storage.sync
  storage.sync.clear().then(() => {
    console.log('Données effacées de storage.sync');
  }).catch(error => {
    console.error('Erreur lors de l\'effacement des données de storage.sync:', error);
  });
  
  // Effacer les données de storage.local
  storage.local.clear().then(() => {
    console.log('Données effacées de storage.local');
  }).catch(error => {
    console.error('Erreur lors de l\'effacement des données de storage.local:', error);
  });
  
  // Fallback pour Chrome qui utilise des callbacks au lieu de Promises
  if (typeof chrome !== 'undefined') {
    chrome.storage.sync.clear(function() {
      console.log('Données effacées de chrome.storage.sync (fallback)');
    });
    
    chrome.storage.local.clear(function() {
      console.log('Données effacées de chrome.storage.local (fallback)');
    });
  }
  
  // Réinitialiser le formulaire
  document.getElementById('schedule-form').reset();
  
  // Réinitialiser les valeurs des sliders
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  days.forEach(day => {
    const slider = document.getElementById(`${day}-lunch`);
    const valueDisplay = document.getElementById(`${day}-lunch-value`);
    
    slider.value = 60; // Valeur par défaut
    valueDisplay.textContent = '60';
  });
  
  // Effacer les résultats
  document.getElementById('schedule-results').innerHTML = '';
  document.getElementById('schedule-results').style.display = 'none';
}

// Fonction pour initialiser les onglets
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // Supprimer la classe active de tous les boutons et masquer tous les indicateurs
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.querySelector('.tab-indicator').classList.add('hidden');
      });
      
      // Masquer tous les panneaux
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Activer le bouton et le panneau sélectionnés et afficher l'indicateur
      button.classList.add('active');
      button.querySelector('.tab-indicator').classList.remove('hidden');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Fonctions utilitaires pour la conversion des heures
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
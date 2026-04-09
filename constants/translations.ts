export type AppLocale = "pt-BR" | "en-US";

export const translations = {
  "pt-BR": {
    tabs: {
      exercises: "Exercícios",
      workouts: "Treinos",
      performance: "Desempenho",
    },
    header: {
      language: "Idioma",
      themeToDark: "Mudar para tema escuro",
      themeToLight: "Mudar para tema claro",
    },
    exercises: {
      title: "Criar Rotina",
      subtitle: "Adicione exercícios personalizados e combine-os em rotinas.",
      statusExercises: "%{count} exercícios",
      statusRoutines: "%{count} rotinas",
      statusSelected: "%{count} selecionados",
      createExercise: "Criar exercício",
      exerciseName: "Nome do exercício",
      muscleGroup: "Grupo muscular",
      addExercise: "Adicionar exercício",
      createRoutine: "Criar rotina",
      routineName: "Nome da rotina (ex: Push Day A)",
      pickExercises: "Escolha os exercícios",
      selectedCount: "%{count} exercícios selecionados",
      selected: "Selecionado",
      select: "Selecionar",
      myRoutines: "Minhas rotinas",
      emptyRoutines: "Nenhuma rotina ainda. Crie sua primeira rotina acima.",
      alerts: {
        missingExerciseNameTitle: "Nome do exercício obrigatório",
        missingExerciseNameMessage: "Digite um nome para o exercício.",
        duplicateExerciseTitle: "Exercício duplicado",
        duplicateExerciseMessage: "Este exercício já existe na sua lista.",
        missingRoutineNameTitle: "Nome da rotina obrigatório",
        missingRoutineNameMessage: "Digite um nome para a rotina.",
        noExercisesSelectedTitle: "Nenhum exercício selecionado",
        noExercisesSelectedMessage:
          "Selecione pelo menos um exercício para criar a rotina.",
        routineCreatedTitle: "Rotina criada",
        routineCreatedMessage:
          "%{name} agora está disponível na sua lista de rotinas.",
      },
    },
    workouts: {
      title: "Treinos",
      subtitle: "Próximo passo: mostrar sessões salvas e detalhes do treino.",
    },
    performance: {
      title: "Desempenho",
      subtitle:
        "Próximo passo: adicionar gráficos de progresso, PR e estatísticas semanais.",
    },
  },
  "en-US": {
    tabs: {
      exercises: "Exercises",
      workouts: "Workouts",
      performance: "Performance",
    },
    header: {
      language: "Language",
      themeToDark: "Switch to dark theme",
      themeToLight: "Switch to light theme",
    },
    exercises: {
      title: "Routine Builder",
      subtitle: "Add your custom exercises and combine them into routines.",
      statusExercises: "%{count} exercises",
      statusRoutines: "%{count} routines",
      statusSelected: "%{count} selected",
      createExercise: "Create Exercise",
      exerciseName: "Exercise name",
      muscleGroup: "Muscle Group",
      addExercise: "Add Exercise",
      createRoutine: "Create Routine",
      routineName: "Routine name (e.g. Push Day A)",
      pickExercises: "Pick exercises",
      selectedCount: "%{count} exercises selected",
      selected: "Selected",
      select: "Select",
      myRoutines: "My Routines",
      emptyRoutines: "No routines yet. Create your first routine above.",
      alerts: {
        missingExerciseNameTitle: "Missing exercise name",
        missingExerciseNameMessage: "Please enter an exercise name.",
        duplicateExerciseTitle: "Duplicate exercise",
        duplicateExerciseMessage: "This exercise already exists in your list.",
        missingRoutineNameTitle: "Missing routine name",
        missingRoutineNameMessage: "Please enter a routine name.",
        noExercisesSelectedTitle: "No exercises selected",
        noExercisesSelectedMessage:
          "Select at least one exercise to create a routine.",
        routineCreatedTitle: "Routine created",
        routineCreatedMessage:
          "%{name} is now available in your routines list.",
      },
    },
    workouts: {
      title: "Workouts",
      subtitle: "Next step: show saved workout sessions and workout details.",
    },
    performance: {
      title: "Performance",
      subtitle:
        "Next step: add progress charts, PR tracking, and weekly stats.",
    },
  },
} as const;

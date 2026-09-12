import type { ProjectFile } from "./types";

export const PROJECT_FILES: ProjectFile[] = [
  // 1. Interfaces
  {
    id: "interface-remote-command",
    name: "IRemoteCommand.cs",
    folder: "interfaces",
    path: "interfaces/IRemoteCommand.cs",
    entityType: "interface",
    role: "Контракт інкапсуляції команд пульта",
    inputs: [],
    outputs: [
      {
        id: "out-execute",
        name: "Execute",
        portType: "IRemoteCommand",
        typeAnnotation: "IRemoteCommand.Execute()",
        description: "Виконання дії команди над отримувачем",
        color: "#A855F7",
      },
    ],
  },
  {
    id: "interface-tv-receiver",
    name: "ITVReceiver.cs",
    folder: "interfaces",
    path: "interfaces/ITVReceiver.cs",
    entityType: "interface",
    role: "Контракт пристрою-отримувача стану",
    inputs: [],
    outputs: [
      {
        id: "out-toggle-power",
        name: "TogglePowerState()",
        portType: "ITVReceiver",
        typeAnnotation: "void",
        description: "Зміна стану живлення",
        color: "#A855F7",
      },
      {
        id: "out-tune-channel",
        name: "TuneChannel(int ch)",
        portType: "ITVReceiver",
        typeAnnotation: "void",
        description: "Перемикання тюнера",
        color: "#A855F7",
      },
      {
        id: "out-set-volume",
        name: "SetVolume(int vol)",
        portType: "ITVReceiver",
        typeAnnotation: "void",
        description: "Регулювання гучності",
        color: "#A855F7",
      },
    ],
  },

  // 2. Commands
  {
    id: "class-power-command",
    name: "PowerCommand.cs",
    folder: "commands",
    path: "commands/PowerCommand.cs",
    entityType: "class",
    role: "Команда перемикання живлення телевізора",
    implementsInterface: "IRemoteCommand",
    inputs: [
      {
        id: "in-contract",
        name: ":IRemoteCommand",
        portType: "IRemoteCommand",
        typeAnnotation: "contract",
        description: "Контракт інтерфейсу IRemoteCommand",
        color: "#A855F7",
      },
      {
        id: "in-receiver",
        name: "receiver",
        portType: "ITVReceiver",
        typeAnnotation: "ITVReceiver (DI)",
        description: "Впровадження залежності отримувача",
        color: "#3B82F6",
      },
    ],
    outputs: [
      {
        id: "out-execute",
        name: "IRemoteCommand.Execute()",
        portType: "IRemoteCommand",
        typeAnnotation: "implements IRemoteCommand",
        description: "Реалізація контракту IRemoteCommand, готова до підключення в конструктор",
        color: "#10B981",
      },
    ],
  },
  {
    id: "class-volume-up-command",
    name: "VolumeUpCommand.cs",
    folder: "commands",
    path: "commands/VolumeUpCommand.cs",
    entityType: "class",
    role: "Команда збільшення гучності",
    implementsInterface: "IRemoteCommand",
    inputs: [
      {
        id: "in-contract",
        name: ":IRemoteCommand",
        portType: "IRemoteCommand",
        typeAnnotation: "contract",
        description: "Контракт інтерфейсу IRemoteCommand",
        color: "#A855F7",
      },
      {
        id: "in-receiver",
        name: "receiver",
        portType: "ITVReceiver",
        typeAnnotation: "ITVReceiver (DI)",
        description: "Впровадження залежності отримувача",
        color: "#3B82F6",
      },
    ],
    outputs: [
      {
        id: "out-execute",
        name: "IRemoteCommand.Execute()",
        portType: "IRemoteCommand",
        typeAnnotation: "implements IRemoteCommand",
        description: "Реалізація контракту IRemoteCommand, готова до підключення в конструктор",
        color: "#10B981",
      },
    ],
  },
  {
    id: "class-channel-next-command",
    name: "ChannelNextCommand.cs",
    folder: "commands",
    path: "commands/ChannelNextCommand.cs",
    entityType: "class",
    role: "Команда перемикання на наступний канал",
    implementsInterface: "IRemoteCommand",
    inputs: [
      {
        id: "in-receiver",
        name: "receiver",
        portType: "ITVReceiver",
        typeAnnotation: "ITVReceiver (DI)",
        description: "Впровадження залежності отримувача",
        color: "#3B82F6",
      },
    ],
    outputs: [
      {
        id: "out-execute",
        name: "IRemoteCommand.Execute()",
        portType: "IRemoteCommand",
        typeAnnotation: "implements IRemoteCommand",
        description: "Реалізація контракту IRemoteCommand, готова до підключення в конструктор",
        color: "#10B981",
      },
    ],
  },

  // 3. Controllers
  {
    id: "class-tv-controller",
    name: "TVController.cs",
    folder: "controllers",
    path: "controllers/TVController.cs",
    entityType: "controller",
    role: "Центральний диспетчер та приймач команд ТВ",
    inputs: [
      {
        id: "in-command-handler",
        name: "ctor(IRemoteCommand command)",
        portType: "IRemoteCommand",
        typeAnnotation: "DI Constructor Slot",
        description: "Слот конструктора: TVController очікує, що DI передасть будь-який об'єкт контракту IRemoteCommand",
        color: "#F59E0B",
      },
      {
        id: "in-display-service",
        name: "displayService",
        portType: "DisplayService",
        typeAnnotation: "DisplayService (DI)",
        description: "Впровадження сервісу відео",
        color: "#3B82F6",
      },
      {
        id: "in-audio-service",
        name: "audioService",
        portType: "AudioService",
        typeAnnotation: "AudioService (DI)",
        description: "Впровадження сервісу звуку",
        color: "#3B82F6",
      },
    ],
    outputs: [
      {
        id: "out-dispatch",
        name: "Dispatch()",
        portType: "void",
        typeAnnotation: "void",
        description: "Диспетчеризація отриманої команди",
        color: "#F59E0B",
      },
      {
        id: "out-on-state-changed",
        name: "OnStateChanged",
        portType: "event",
        typeAnnotation: "event",
        description: "Подія оновлення стану телевізора",
        color: "#F59E0B",
      },
    ],
  },

  // 4. Services
  {
    id: "service-audio",
    name: "AudioService.cs",
    folder: "services",
    path: "services/AudioService.cs",
    entityType: "service",
    role: "Сервіс керування аудіо-підсилювачем",
    inputs: [
      {
        id: "in-audio-hw",
        name: "amplifierDriver",
        portType: "hardware",
        typeAnnotation: "LM386 Driver",
        description: "Апаратний драйвер підсилювача",
        color: "#10B981",
      },
    ],
    outputs: [
      {
        id: "out-set-vol",
        name: "SetVolume(int level)",
        portType: "AudioService",
        typeAnnotation: "void",
        description: "Встановлення рівня гучності",
        color: "#10B981",
      },
      {
        id: "out-mute",
        name: "MuteToggle()",
        portType: "AudioService",
        typeAnnotation: "bool",
        description: "Перемикання беззвучного режиму",
        color: "#10B981",
      },
    ],
  },
  {
    id: "service-display",
    name: "DisplayService.cs",
    folder: "services",
    path: "services/DisplayService.cs",
    entityType: "service",
    role: "Сервіс керування матрицею та OSD",
    inputs: [
      {
        id: "in-display-hw",
        name: "crtDriver",
        portType: "hardware",
        typeAnnotation: "TDA9351 Driver",
        description: "Апаратний драйвер матриці",
        color: "#10B981",
      },
    ],
    outputs: [
      {
        id: "out-render-osd",
        name: "RenderOSD(string text)",
        portType: "DisplayService",
        typeAnnotation: "void",
        description: "Вивід повідомлень на екран",
        color: "#10B981",
      },
      {
        id: "out-blank",
        name: "BlankScreen()",
        portType: "DisplayService",
        typeAnnotation: "void",
        description: "Очищення/вимкнення растра",
        color: "#10B981",
      },
    ],
  },
];

export const FOLDER_LABELS: Record<string, string> = {
  interfaces: "interfaces/",
  commands: "commands/",
  controllers: "controllers/",
  services: "services/",
};

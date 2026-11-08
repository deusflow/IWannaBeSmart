/**
 * @file packages/sim-engine/src/runtime/labs/xrayScenarios.ts
 * @description Scenarios for X-Ray Live Execution Flow and DI Survival Race
 */

export interface XRayFile {
  id: string; // "program" | "interface" | "service"
  fileName: string; // "Program.cs"
  lines: string[]; // code lines, WITHOUT Cyrillic comments
}

export interface XRayStep {
  fileId: string;
  line: number; // 0-based index in lines
  noteKey: string; // i18n key for step note
  defaultNote: string; // Ukrainian fallback
  dataLabel?: string; // what the flow carries, e.g. "Resolve TvController"
}

export interface XRayScenario {
  id: string;
  stationId: "tv" | "pos" | "iot" | "api" | "git" | "bandit" | "vertex" | "fde" | "rag" | "cyber";
  language: "csharp" | "go";
  titleKey: string;
  defaultTitle: string;
  files: XRayFile[]; // exactly 3 files
  steps: XRayStep[]; // 6 to 10 steps
  rewardXp: number; // e.g. 30
}

export interface DiRaceScenario {
  id: string;
  stationId: XRayScenario["stationId"];
  titleKey: string;
  defaultTitle: string;
  oldService: string; // "LegacyPaymentGateway"
  newService: string; // "StripePaymentGateway"
  consumerFiles: string[]; // exactly 5 file names
  timeLimitSeconds: number; // 10
  rewardXp: number; // 40
}

export const XRAY_SCENARIOS: XRayScenario[] = [
  {
    id: "xray-tv-di-flow",
    stationId: "tv",
    language: "csharp",
    titleKey: "labs.xray.tvDiFlowTitle",
    defaultTitle: "Живий потік виконання: Dependency Injection у Smart TV",
    rewardXp: 30,
    files: [
      {
        id: "program",
        fileName: "Program.cs",
        lines: [
          "var builder = Host.CreateDefaultBuilder();",
          "builder.ConfigureServices(services => {",
          "    services.AddSingleton<IRemoteCommand, PowerCommand>();",
          "    services.AddSingleton<TvController>();",
          "});",
          "var app = builder.Build();",
          "var controller = app.Services.GetRequiredService<TvController>();",
          "controller.PressPowerButton();",
        ],
      },
      {
        id: "interface",
        fileName: "IRemoteCommand.cs",
        lines: [
          "public interface IRemoteCommand",
          "{",
          "    string CommandName { get; }",
          "    void Execute();",
          "}",
        ],
      },
      {
        id: "service",
        fileName: "PowerCommand.cs",
        lines: [
          "public class PowerCommand : IRemoteCommand",
          "{",
          "    private readonly SmartTvHardware _tv;",
          "    public string CommandName => \"POWER_TOGGLE\";",
          "    public PowerCommand(SmartTvHardware tv) => _tv = tv;",
          "    public void Execute()",
          "    {",
          "        _tv.TogglePowerState();",
          "    }",
          "}",
        ],
      },
    ],
    steps: [
      {
        fileId: "program",
        line: 2,
        noteKey: "labs.xray.step1Note",
        defaultNote: "DI-контейнер реєструє зв'язок: коли потрібен IRemoteCommand, створити PowerCommand як Singleton.",
        dataLabel: "services.AddSingleton<IRemoteCommand, PowerCommand>()",
      },
      {
        fileId: "program",
        line: 6,
        noteKey: "labs.xray.step2Note",
        defaultNote: "Контейнер розв'язує залежності та передає реалізацію в конструктор TvController.",
        dataLabel: "Resolve TvController",
      },
      {
        fileId: "program",
        line: 7,
        noteKey: "labs.xray.step3Note",
        defaultNote: "Користувач натискає кнопку живлення на пульті. Контролер викликає метод команди.",
        dataLabel: "controller.PressPowerButton()",
      },
      {
        fileId: "interface",
        line: 3,
        noteKey: "labs.xray.step4Note",
        defaultNote: "Виклик проходить крізь контракт IRemoteCommand. Контролер не знає про деталі реалізації.",
        dataLabel: "IRemoteCommand.Execute()",
      },
      {
        fileId: "service",
        line: 5,
        noteKey: "labs.xray.step5Note",
        defaultNote: "Керування переходить до конкретної реалізації PowerCommand.Execute().",
        dataLabel: "PowerCommand.Execute()",
      },
      {
        fileId: "service",
        line: 7,
        noteKey: "labs.xray.step6Note",
        defaultNote: "Команда викликає низькорівневий драйвер SmartTvHardware для зміни стану живлення.",
        dataLabel: "_tv.TogglePowerState()",
      },
      {
        fileId: "program",
        line: 7,
        noteKey: "labs.xray.step7Note",
        defaultNote: "Виконання повертається в точку виклику. Телевізор увімкнено без жорсткої зв'язності коду.",
        dataLabel: "TV State: ON",
      },
    ],
  },
];

export const DI_RACE_SCENARIOS: DiRaceScenario[] = [
  {
    id: "di-race-tv",
    stationId: "tv",
    titleKey: "labs.diRace.tvTitle",
    defaultTitle: "Гонка без DI проти з DI: заміна платіжного шлюзу",
    oldService: "LegacyPaymentGateway",
    newService: "StripePaymentGateway",
    consumerFiles: [
      "CheckoutController.cs",
      "SubscriptionManager.cs",
      "RefundProcessor.cs",
      "InvoiceGenerator.cs",
      "PosTerminalSync.cs",
    ],
    timeLimitSeconds: 10,
    rewardXp: 40,
  },
];


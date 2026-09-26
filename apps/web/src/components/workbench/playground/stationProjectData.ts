/**
 * @file apps/web/src/components/workbench/playground/stationProjectData.ts
 * @description Pure data definitions and file trees for ProjectExplorerBar across all 5 stations.
 *              Extracted to isolate static mock project structures from React rendering.
 */

export interface ProjectFile {
  id: string;
  name: string;
  type: "file" | "folder";
  icon?: "code" | "config" | "interface" | "driver" | "data";
  children?: ProjectFile[];
  badge?: string;
  codeSnippet?: {
    csharp?: string;
    go?: string;
    python?: string;
    yaml?: string;
    typescript?: string;
    [lang: string]: string | undefined;
  };
  description?: {
    ua: string;
    en: string;
    da: string;
  };
}

export const STATION_CALLOUTS: Record<
  string,
  {
    title: Record<"ua" | "en" | "da", string>;
    body: Record<"ua" | "en" | "da", string>;
    note: Record<"ua" | "en" | "da", string>;
  }
> = {
  cyber: {
    title: {
      ua: "Зняття ілюзії магічного коду (Google Cybersecurity & SOC):",
      en: "Demystifying Magic Code (Google Cybersecurity & SOC):",
      da: "Afmystificering af magisk kode (Google Cybersecurity & SOC):",
    },
    body: {
      ua: "Аналітика кібербезпеки не є таємницею. Це структурований парсинг Syslog, перевірка TCP-прапорців у PCAP пакетах та реагування за матрицею NIST CSF.",
      en: "Cybersecurity analysis is not magic. It is structured Syslog parsing, TCP flag inspection in PCAP frames, and incident response via NIST CSF.",
      da: "Cybersikkerhedsanalyse er ikke magi. Det er struktureret parsing af Syslog, TCP-flaginspektion i PCAP-frames og hændelseshåndtering via NIST CSF.",
    },
    note: {
      ua: "Кожна атака залишає цифровий слід (TTP у MITRE ATT&CK), який можна детектувати та локалізувати правилами iptables.",
      en: "Every cyberattack leaves a digital footprint (MITRE ATT&CK TTP) detectable and containable with iptables rules.",
      da: "Hvert cyberangreb efterlader et digitalt fodaftryk (MITRE ATT&CK TTP), der kan isoleres med iptables-regler.",
    },
  },
  rag: {
    title: {
      ua: "Зняття ілюзії магічного коду (IBM RAG & Agentic AI):",
      en: "Demystifying Magic Code (IBM RAG & Agentic AI):",
      da: "Afmystificering af magisk kode (IBM RAG & Agentic AI):",
    },
    body: {
      ua: "Векторний пошук — це не магія, а звичайний розрахунок косинусного кута між векторами в R⁸. Агент ReAct — це детермінований скінченний автомат.",
      en: "Vector search is not magic, but simple cosine angle calculations in R⁸. A ReAct agent is a deterministic finite state machine.",
      da: "Vektorsøgning er ikke magi, men simpel cosinusvinkelberegning i R⁸. En ReAct-agent er en deterministisk endelig tilstandsmaskine.",
    },
    note: {
      ua: "RAGAS перевіряє, чи кожен факт у відповіді має пряме цитування з чанків бази знань.",
      en: "RAGAS verifies that every fact in the response has a direct citation from knowledge base chunks.",
      da: "RAGAS verificerer, at hvert faktum i svaret har en direkte kildehenvisning fra vidensbasens chunks.",
    },
  },
  api: {
    title: {
      ua: "Зняття ілюзії магічного коду (ASP.NET / Go HTTP):",
      en: "Demystifying Magic Code (ASP.NET / Go HTTP):",
      da: "Afmystificering af magisk kode (ASP.NET / Go HTTP):",
    },
    body: {
      ua: "Усі ендпоінти реєструються у конвеєрі Kestrel/net/http всередині точки входу. Жоден маршрут не висить у повітрі.",
      en: "All endpoints are explicitly registered in the Kestrel / net/http pipeline inside the entrypoint. No route hangs in midair.",
      da: "Alle endepunkter registreres eksplicit i Kestrel / net/http pipelinen i programmets startpunkt. Ingen ruter svæver i luften.",
    },
    note: {
      ua: "Results.Ok(...) виділяє пам'ять для JSON-відповіді в Heap, а сокет відправляє байти клієнту.",
      en: "Results.Ok(...) allocates heap memory for the JSON payload, and the underlying socket transmits bytes to the client.",
      da: "Results.Ok(...) allokerer heap-hukommelse til JSON-svaret, og soklen sender bytes til klienten.",
    },
  },
  pos: {
    title: {
      ua: "Зняття ілюзії магічного коду (POS Terminal):",
      en: "Demystifying Magic Code (POS Terminal):",
      da: "Afmystificering af magisk kode (POS Terminal):",
    },
    body: {
      ua: "Транзакційний цикл касира виконується всередині сесії CashierSession з перевіркою інваріантів рахунку.",
      en: "The cashier transaction loop runs within a stateful CashierSession, strictly enforcing financial account invariants.",
      da: "Kassereks transaktionsløkke afvikles i en CashierSession med streng validering af kontoinvarianter.",
    },
    note: {
      ua: "Сума balance та статус транзакції зберігаються у Heap терміналу.",
      en: "The balance amount and transaction state machine reside in the terminal's Heap memory.",
      da: "Saldobeløb og transaktionens tilstandsmaskine opbevares i terminalens Heap-hukommelse.",
    },
  },
  git: {
    title: {
      ua: "Зняття ілюзії магічного коду (Git DAG Engine):",
      en: "Demystifying Magic Code (Git DAG Engine):",
      da: "Afmystificering af magisk kode (Git DAG Engine):",
    },
    body: {
      ua: "Команди git маніпулюють об'єктами у сховищі .git та вказівником HEAD, формуючи ациклічний граф (DAG).",
      en: "Git commands manipulate immutable objects in the .git storage and update the HEAD pointer, building a Directed Acyclic Graph (DAG).",
      da: "Git-kommandoer manipulerer uforanderlige objekter i .git-arkivet og opdaterer HEAD-viseren for at danne en retningsbestemt acyklisk graf (DAG).",
    },
    note: {
      ua: "HEAD посилається на хеш останнього коміту у дереві ревізій.",
      en: "HEAD references the SHA-1 commit hash at the frontier of the revision tree.",
      da: "HEAD refererer til SHA-1-hashet for den seneste commit i revisionstræet.",
    },
  },
  bandit: {
    title: {
      ua: "Зняття ілюзії магічного коду (Cyber Defense Pipeline):",
      en: "Demystifying Magic Code (Cyber Defense Pipeline):",
      da: "Afmystificering af magisk kode (Cyber Defense Pipeline):",
    },
    body: {
      ua: "SecurityMiddleware перехоплює вхідний потік байтів до потрапляння в контролер, блокуючи ін'єкції та атаки.",
      en: "SecurityMiddleware intercepts the incoming byte stream before reaching the controller, filtering injection vectors and unauthorized payloads.",
      da: "SecurityMiddleware opfanger den indgående bytestrøm før controlleren, og blokerer injektioner og ondsindede angreb.",
    },
    note: {
      ua: "Криптографічні ключі та токени зберігаються в захищеній пам'ять процесу, запобігаючи витоку через стек або логи.",
      en: "Cryptographic keys and tokens are held in secure process memory, preventing leakage through stack dumps or debug traces.",
      da: "Kryptografiske nøgler og tokens opbevares i beskyttet proceshukommelse for at forhindre lækage via stakdumps eller logs.",
    },
  },
  tv: {
    title: {
      ua: "Зняття ілюзії магічного коду (Smart TV Chassis):",
      en: "Demystifying Magic Code (Smart TV Chassis):",
      da: "Afmystificering af magisk kode (Smart TV Chassis):",
    },
    body: {
      ua: "Усі команди виконуються всередині точки входу Main(). Жоден рядок не існує у вакуумі.",
      en: "All commands execute strictly within the Main() entrypoint. No instruction operates in a vacuum.",
      da: "Alle kommandoer udføres i programmets startpunkt Main(). Ingen instruktion svæver i et tomrum.",
    },
    note: {
      ua: "TV tv = new TV(); виділяє пам'ять у Heap, посилання живе у Stack.",
      en: "TV tv = new TV(); allocates memory on the Heap, while the reference handle lives on the call Stack.",
      da: "TV tv = new TV(); allokerer hukommelse på Heap, mens referencen lever på stakken (Stack).",
    },
  },
  vertex: {
    title: {
      ua: "Зняття ілюзії магічного коду (Google Vertex AI & Cloud MLOps):",
      en: "Demystifying Magic Code (Google Vertex AI & Cloud MLOps):",
      da: "Afmystificering af magisk kode (Google Vertex AI & Cloud MLOps):",
    },
    body: {
      ua: "Усі кроки підготовки даних, навчання та інференсу оркеструються через Kubeflow DAG та ізольовані контейнери у VPC.",
      en: "All data preprocessing, distributed training, and serving endpoints are orchestrated via Kubeflow DAGs and isolated VPC containers.",
      da: "Alle dataforberedelses-, trænings- og udrulningstrin orkestreres via Kubeflow DAGs og isolerede VPC-containere.",
    },
    note: {
      ua: "Артефакти фіксуються в GCS, а ваги моделі зберігаються у Vertex Model Registry з прив'язкою до Git SHA.",
      en: "Artifacts are persisted in GCS buckets, and model weights are tracked in Vertex Model Registry tied to Git SHA.",
      da: "Artefakter gemmes i GCS buckets, og modelvægte spores i Vertex Model Registry knyttet til Git SHA.",
    },
  },
  fde: {
    title: {
      ua: "Зняття ілюзії магічного коду (Applied AI & Forward Deployed Engineering):",
      en: "Demystifying Magic Code (Applied AI & Forward Deployed Engineering):",
      da: "Afmystificering af magisk kode (Applied AI & Forward Deployed Engineering):",
    },
    body: {
      ua: "Бойовий агентний граф об'єднує клієнтські legacy системи, RAG векторні бази, семантичні бар'єри та Zero-Trust автентифікацію.",
      en: "The production agent graph integrates client legacy systems, RAG vector indexes, semantic guardrails, and Zero-Trust auth.",
      da: "Produktionsagentgrafen integrerer klientens legacy-systemer, RAG-vektorindekser, semantiske guardrails og Zero-Trust godkendelse.",
    },
    note: {
      ua: "Кожен виклик інструмента валідується проти прав сесії, а чутливі дані (PII) хешуються у незмінному аудит-журналі.",
      en: "Every tool invocation is validated against session claims, and PII is cryptographically masked in immutable audit trails.",
      da: "Hvert værktøjskald valideres mod sessionsrettigheder, og PII maskeres kryptografisk i uforanderlige revisionsspor.",
    },
  },
};

export function getStationProjectFiles(
  activeStation: string,
  isFintech: boolean,
  codeLang: "csharp" | "go" | "python" | "yaml" | "typescript",
  currentCode: string
): ProjectFile[] {
  // TV project files
  const tvFiles: ProjectFile[] = [
    {
      id: "solution-root",
      name: "SmartTvSolution",
      type: "folder",
      children: [
        {
          id: "csproj",
          name: "SmartTvApp.csproj",
          type: "file",
          icon: "config",
          badge: ".NET 9.0",
          codeSnippet: {
            csharp: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>`,
            go: `module github.com/iwannabesmart/tv-core

go 1.23

require (
    // Standard embedded RTOS bindings
)`,
          },
          description: {
            ua: "Файл конфігурації проєкту: визначає цільову платформу .NET 9.0, вмикає сувору перевірку Nullable типів та формує виконуваний файл .exe.",
            en: "Project configuration file: defines target runtime .NET 9.0, enables strict Nullable reference types, and configures binary output.",
            da: "Projektkonfigurationsfil: definerer målversion .NET 9.0 og aktiverer strenge Nullable-kontroller.",
          },
        },
        {
          id: "program-cs",
          name: codeLang === "csharp" ? "Program.cs" : "main.go",
          type: "file",
          icon: "code",
          badge: "Main()",
          codeSnippet: {
            csharp: `using System;
using SmartTvApp.Hardware;

namespace SmartTvApp;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("[RTOS INITIALIZED] Booting TV chassis...");
        TV tv = new TV();

${currentCode
  .split("\n")
  .map((line) => "        " + line)
  .join("\n")}

        Console.WriteLine($"[TELEMETRY] Power: {tv.IsOn}, Channel: {tv.Channel}");
    }
}`,
            go: `package main

import (
    "fmt"
    "github.com/iwannabesmart/tv-core/hardware"
)

func main() {
    fmt.Println("[RTOS INITIALIZED] Booting TV chassis...")
    tv := hardware.NewTV()

${currentCode
  .split("\n")
  .map((line) => "    " + line)
  .join("\n")}

    fmt.Printf("[TELEMETRY] Power: %t, Channel: %d\\n", tv.IsOn, tv.Channel)
}`,
          },
          description: {
            ua: "Головна точка входу програми: саме тут рантайм створює об'єкт телевізора в купі (Heap) та послідовно виконує ваші інструкції.",
            en: "Main program entrypoint: this is where runtime allocates the TV instance in Heap and sequentially runs your instructions.",
            da: "Hovedprogrammets startpunkt: her allokeres TV-instansen i Heap, og instruktionerne udføres sekventielt.",
          },
        },
        {
          id: "folder-commands",
          name: "Commands",
          type: "folder",
          children: [
            {
              id: "power-command-cs",
              name: codeLang === "csharp" ? "PowerCommand.cs" : "power_command.go",
              type: "file",
              icon: "code",
              badge: "ICommand",
              codeSnippet: {
                csharp: `namespace SmartTvApp.Commands;

public class PowerCommand
{
    private readonly TvRelayDriver _driver;
    public PowerCommand(TvRelayDriver driver) => _driver = driver;

    public void Execute()
    {
        if (_driver != null)
        {
            _driver.CloseRelayContact(25_000);
        }
    }
}`,
                go: `package commands

type PowerCommand struct {
    driver *TvRelayDriver
}

func (c *PowerCommand) Execute() {
    if c.driver != nil {
        c.driver.CloseRelayContact(25000)
    }
}`,
              },
              description: {
                ua: "Патерн Command: інкапсулює дію замикання реле живлення та розчіплює пульт від конкретного заліза.",
                en: "Command Pattern: encapsulates the relay activation action, decoupling remote control from hardware specifics.",
                da: "Command Pattern: indkapsler relæaktiveringen.",
              },
            },
          ],
        },
        {
          id: "folder-hardware",
          name: "Hardware",
          type: "folder",
          children: [
            {
              id: "tv-hardware-driver",
              name: codeLang === "csharp" ? "TV.cs" : "tv.go",
              type: "file",
              icon: "driver",
              badge: "Chassis",
              codeSnippet: {
                csharp: `namespace SmartTvApp.Hardware;

public class TV
{
    public bool IsOn { get; private set; } = false;
    public int Channel { get; private set; } = 1;
    public int Volume { get; private set; } = 20;

    public void PowerOn() => IsOn = true;
    public void PowerOff() => IsOn = false;
    public void SetChannel(int ch) => Channel = ch;
    public void VolumeUp() => Volume++;
}`,
                go: `package hardware

type TV struct {
    IsOn    bool
    Channel int
    Volume  int
}

func NewTV() *TV {
    return &TV{IsOn: false, Channel: 1, Volume: 20}
}

func (t *TV) PowerOn() { t.IsOn = true }
func (t *TV) PowerOff() { t.IsOn = false }
func (t *TV) SetChannel(ch int) { t.Channel = ch }`,
              },
              description: {
                ua: "Клас апаратного контролера телевізора: інкапсулює внутрішній стан приладу та захищає поля від некоректних змін ззовні.",
                en: "Hardware TV controller class: encapsulates internal state and protects fields from invalid external mutations.",
                da: "Hardware TV-controller klasse: indkapsler intern tilstand og beskytter felter.",
              },
            },
            {
              id: "tv-relay-driver-cs",
              name: codeLang === "csharp" ? "TvRelayDriver.cs" : "relay_driver.go",
              type: "file",
              icon: "driver",
              badge: "Relay 25kV",
              codeSnippet: {
                csharp: `namespace SmartTvApp.Hardware;

public class TvRelayDriver
{
    public bool IsCoilEnergized { get; private set; }
    public int ActualVoltage { get; private set; }

    public bool CloseRelayContact(int targetAnodeVoltage)
    {
        this.IsCoilEnergized = true;
        this.ActualVoltage = targetAnodeVoltage;
        return true;
    }
}`,
                go: `package hardware

type TvRelayDriver struct {
    IsCoilEnergized bool
    ActualVoltage   int
}

func (d *TvRelayDriver) CloseRelayContact(voltage int) bool {
    d.IsCoilEnergized = true
    d.ActualVoltage = voltage
    return true
}`,
              },
              description: {
                ua: "Драйвер високовольтного реле живлення кінескопа: керує подачею 25 кВ на анод.",
                en: "Kinescope high-voltage relay driver: controls 25kV power feed to CRT anode.",
                da: "Højspændingsrelædriver: styrer 25kV strøm til CRT anode.",
              },
            },
          ],
        },
      ],
    },
  ];

  // POS project files
  const fintechFiles: ProjectFile[] = [
    {
      id: "solution-root-fintech",
      name: "PosSolution",
      type: "folder",
      children: [
        {
          id: "pos-csproj",
          name: "PosTerminal.csproj",
          type: "file",
          icon: "config",
          badge: ".NET 9.0",
          codeSnippet: {
            csharp: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>`,
            go: `module github.com/iwannabesmart/pos-terminal

go 1.23`,
          },
          description: {
            ua: "Файл проєкту платіжного POS-термінала: містить суворі налаштування фінансової безпеки та аудиту транзакцій.",
            en: "Payment POS terminal project file: configured with strict financial security rules and audit logging.",
            da: "Betalingsterminal projektfil: konfigureret med strenge finansielle sikkerhedsregler.",
          },
        },
        {
          id: "program-cs",
          name: codeLang === "csharp" ? "CashierSession.cs" : "main.go",
          type: "file",
          icon: "code",
          badge: "Main()",
          codeSnippet: {
            csharp: `using System;
using PosApp.Security;

namespace PosApp;

public class CashierSession
{
    public static void Main(string[] args)
    {
        Console.WriteLine("[POS SECURE TERMINAL] Starting cashier session...");
        decimal balance = 100.00m;
        string status = "READY";

${currentCode
  .split("\n")
  .map((line) => "        " + line)
  .join("\n")}

        Console.WriteLine($"[LEDGER AUDIT] Balance: {balance:C}, Status: {status}");
    }
}`,
            go: `package main

import (
    "fmt"
)

func main() {
    fmt.Println("[POS SECURE TERMINAL] Starting cashier session...")
    balance := 100.00
    status := "READY"

${currentCode
  .split("\n")
  .map((line) => "    " + line)
  .join("\n")}

    fmt.Printf("[LEDGER AUDIT] Balance: %.2f, Status: %s\\n", balance, status)
}`,
          },
          description: {
            ua: "Сесія касира: точка входу транзакційного циклу термінала з перевіркою інваріантів рахунку.",
            en: "Cashier processing session entrypoint executing financial state transitions.",
            da: "Kassebehandlingssession startpunkt for finansielle transaktioner.",
          },
        },
        {
          id: "folder-services",
          name: "Services",
          type: "folder",
          children: [
            {
              id: "account-ledger-cs",
              name: codeLang === "csharp" ? "AccountLedger.cs" : "ledger.go",
              type: "file",
              icon: "data",
              badge: "Ledger",
              codeSnippet: {
                csharp: `namespace PosApp.Services;

public class AccountLedger
{
    public decimal Balance { get; set; } = 1200m;

    public bool Debit(decimal amount)
    {
        if (amount > this.Balance) return false;
        this.Balance -= amount;
        return true;
    }
}`,
                go: `package services

type AccountLedger struct {
    Balance float64
}

func (l *AccountLedger) Debit(amount float64) bool {
    if amount > l.Balance { return false }
    l.Balance -= amount
    return true
}`,
              },
              description: {
                ua: "Бухгалтерська книга рахунків: контролює інваріанти залишку коштів та запобігає несанкціонованому овердрафту.",
                en: "Account Ledger: enforces balance invariant constraints against unauthorized overdraft.",
                da: "Hovedbog: håndhæver saldobegrænsninger.",
              },
            },
          ],
        },
        {
          id: "folder-hardware",
          name: "Hardware",
          type: "folder",
          children: [
            {
              id: "nfc-reader-cs",
              name: codeLang === "csharp" ? "NfcReader.cs" : "nfc.go",
              type: "file",
              icon: "driver",
              badge: "NFC EMV",
              codeSnippet: {
                csharp: `namespace PosApp.Hardware;

public class NfcReader
{
    public string GenerateAuthCryptogram() => "ARQC-9182-APPROVED";
}`,
                go: `package hardware

type NfcReader struct{}

func (n *NfcReader) GenerateAuthCryptogram() string {
    return "ARQC-9182-APPROVED"
}`,
              },
              description: {
                ua: "Безконтактний NFC рідер: обробляє криптографічні протоколи EMV банківських карток.",
                en: "Contactless NFC Reader: processes EMV contactless cryptographic card transactions.",
                da: "NFC-læser: håndterer kontaktløse transaktioner.",
              },
            },
          ],
        },
        {
          id: "pos-gateway-contract",
          name: codeLang === "csharp" ? "IPaymentGateway.cs" : "gateway.go",
          type: "file",
          icon: "interface",
          badge: "Interface",
          codeSnippet: {
            csharp: `namespace PosApp.Contracts;

public interface IPaymentGateway
{
    bool Charge(decimal totalAmount);
}

public class DankortGateway : IPaymentGateway
{
    public bool Charge(decimal totalAmount) => true;
}`,
            go: `package contracts

type IPaymentGateway interface {
    Charge(totalAmount float64) bool
}`,
          },
          description: {
            ua: "Контракт шлюзу еквайрингу: забезпечує поліморфну взаємодію з будь-яким банківським провайдером.",
            en: "Acquiring gateway contract: enables polymorphic integration across banking networks.",
            da: "Acquiring gateway kontrakt: muliggør polymorf integration på tværs af banker.",
          },
        },
      ],
    },
  ];

  // API Forge project files
  const apiFiles: ProjectFile[] = [
    {
      id: "solution-root-api",
      name: "ApiForgeSolution",
      type: "folder",
      children: [
        {
          id: "api-csproj",
          name: "ApiForgeServer.csproj",
          type: "file",
          icon: "config",
          badge: "Web SDK",
          codeSnippet: {
            csharp: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>`,
            go: `module github.com/iwannabesmart/api-forge

go 1.23

require (
    // Standard net/http standard library
)`,
          },
          description: {
            ua: "Файл конфігурації веб-сервера: використовує Microsoft.NET.Sdk.Web для створення високопродуктивного RESTful Kestrel сервера.",
            en: "Web server configuration file utilizing ASP.NET Core Web SDK for high-performance Kestrel API.",
            da: "Webserver konfigurationsfil, der benytter ASP.NET Core Web SDK.",
          },
        },
        {
          id: "program-cs",
          name: codeLang === "csharp" ? "Program.cs" : "main.go",
          type: "file",
          icon: "code",
          badge: "Endpoints",
          codeSnippet: {
            csharp: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// ── Register Minimal API Endpoints ──
${currentCode}

app.Run("http://0.0.0.0:8080");`,
            go: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    // ── Register HTTP Handlers ──
${currentCode}

    fmt.Println("API Server listening on :8080...")
    http.ListenAndServe(":8080", nil)
}`,
          },
          description: {
            ua: "Точка входу API: реєстрація маршрутів (Endpoints), обробників запитів та запуск Kestrel HTTP сервера на порту 8080.",
            en: "API Server entrypoint: registers HTTP route endpoints, handlers, and starts listening on port 8080.",
            da: "API-serverens startpunkt: registrerer ruter og starter HTTP-lytter.",
          },
        },
        {
          id: "folder-controllers",
          name: "Controllers",
          type: "folder",
          children: [
            {
              id: "orders-controller-cs",
              name: codeLang === "csharp" ? "OrdersController.cs" : "orders_controller.go",
              type: "file",
              icon: "code",
              badge: "Controller",
              codeSnippet: {
                csharp: `namespace ApiForge.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;
    public OrdersController(OrderService svc) => _orderService = svc;

    [HttpPost]
    public async Task<IResult> CreateOrder([FromBody] OrderDto dto)
    {
        var result = await _orderService.PlaceOrderAsync(dto);
        return Results.Created($"/api/orders/{result.Id}", result);
    }
}`,
                go: `package controllers

type OrdersController struct {
    service *OrderService
}`,
              },
              description: {
                ua: "Контролер замовлень: перехоплює HTTP POST запити, десеріалізує JSON та делегує обробку сервісу.",
                en: "Orders Controller: intercepts HTTP POST requests, deserializes JSON payload, and delegates to service.",
                da: "Orders Controller: modtager HTTP POST anmodninger.",
              },
            },
          ],
        },
        {
          id: "folder-services",
          name: "Services",
          type: "folder",
          children: [
            {
              id: "order-service-cs",
              name: codeLang === "csharp" ? "OrderService.cs" : "order_service.go",
              type: "file",
              icon: "code",
              badge: "Domain Service",
              codeSnippet: {
                csharp: `namespace ApiForge.Services;

public class OrderService
{
    private readonly OrderRepository _repo;
    public OrderService(OrderRepository repo) => _repo = repo;

    public async Task<OrderResult> PlaceOrderAsync(OrderDto dto)
    {
        if (dto.Amount <= 0) throw new ArgumentException("Invalid amount");
        var order = new Order(Guid.NewGuid(), dto.ItemId, dto.Amount);
        await _repo.SaveAsync(order);
        return new OrderResult(order.Id, "Confirmed");
    }
}`,
                go: `package services

type OrderService struct {
    repo *OrderRepository
}`,
              },
              description: {
                ua: "Доменний сервіс замовлень: виконує бізнес-правила та валідацію інваріантів перед збереженням.",
                en: "Domain Order Service: executes business invariants and domain validation before persisting.",
                da: "Domæneservice: udfører forretningslogik.",
              },
            },
          ],
        },
        {
          id: "folder-repositories",
          name: "Repositories",
          type: "folder",
          children: [
            {
              id: "order-repository-cs",
              name: codeLang === "csharp" ? "OrderRepository.cs" : "order_repository.go",
              type: "file",
              icon: "data",
              badge: "Repository",
              codeSnippet: {
                csharp: `namespace ApiForge.Repositories;

public class OrderRepository
{
    private readonly Dictionary<Guid, Order> _inMemoryDb = new();

    public async Task SaveAsync(Order order)
    {
        _inMemoryDb[order.Id] = order;
        await Task.Yield();
    }
}`,
                go: `package repositories

type OrderRepository struct{}`,
              },
              description: {
                ua: "Репозиторій замовлень: забезпечує абстракцію збереження даних у базі або сховищі.",
                en: "Order Repository: abstracts persistence layer storage operations.",
                da: "Order Repository: abstraherer datalagring.",
              },
            },
          ],
        },
        {
          id: "order-dto",
          name: codeLang === "csharp" ? "OrderDto.cs" : "order_dto.go",
          type: "file",
          icon: "data",
          badge: "DTO Contract",
          codeSnippet: {
            csharp: `namespace ApiForge.Models;

public record OrderDto(
    string Item,
    int Quantity
);`,
            go: `package models

type OrderDto struct {
    Item     string \`json:"item"\`
    Quantity int    \`json:"quantity"\`
}`,
          },
          description: {
            ua: "Data Transfer Object (DTO): контракт структури даних, що передається через мережевий кабель між клієнтом та сервером.",
            en: "Data Transfer Object (DTO): wire contract defining the JSON payload shape between client and server.",
            da: "Data Transfer Object (DTO): netværkskontrakt for JSON-nyttelast.",
          },
        },
        {
          id: "client",
          name: "Client",
          type: "folder",
          children: [
            {
              id: "curl-request",
              name: "response.http",
              type: "file",
              icon: "data",
              badge: "201 Created",
              codeSnippet: {
                csharp: `HTTP/1.1 201 Created
Location: /api/orders/8f3b-4192
Content-Type: application/json

{"id":"8f3b-4192","status":"Confirmed"}`,
                go: `HTTP/1.1 201 Created
Location: /api/orders/8f3b-4192
Content-Type: application/json

{"id":"8f3b-4192","status":"Confirmed"}`,
              },
              description: {
                ua: "Фінальна HTTP-відповідь 201 Created, отримана тестовим клієнтом через сокет після проходження повного ланцюга API.",
                en: "Final HTTP 201 Created response received by client test runner over network socket after completing full API pipeline.",
                da: "Endelig HTTP 201 Created respons modtaget af testklienten over netværkssokkel efter fuldførelse af API-pipelinen.",
              },
            },
          ],
        },
      ],
    },
  ];

  // Git Time Machine project files
  const gitFiles: ProjectFile[] = [
    {
      id: "solution-root-git",
      name: "GitRepositoryRoot",
      type: "folder",
      children: [
        {
          id: "git-head",
          name: ".git/HEAD",
          type: "file",
          icon: "config",
          badge: "Ref Pointer",
          codeSnippet: {
            csharp: `ref: refs/heads/main`,
            go: `ref: refs/heads/main`,
          },
          description: {
            ua: "Вказівник HEAD: містить посилання на активну гілку або прямий хеш коміту (detached HEAD).",
            en: "HEAD reference pointer: designates the current checked-out branch or commit hash.",
            da: "HEAD reference pointer: angiver den aktuelt udtjekkede gren.",
          },
        },
        {
          id: "program-cs",
          name: "device.config",
          type: "file",
          icon: "code",
          badge: "Tracked File",
          codeSnippet: {
            csharp: `# Physical Device Configuration
baudrate=115200
parity=none
device_id=RADAR-01
firmware_version=2.4.0`,
            go: `# Physical Device Configuration
baudrate=115200
parity=none
device_id=RADAR-01
firmware_version=2.4.0`,
          },
          description: {
            ua: "Файл конфігурації у робочому дереві: саме тут відбуваються зміни, фіксуються коміти та виникають конфлікти злиття.",
            en: "Tracked working tree file: subject to commit snapshots, branch divergences, and merge conflicts.",
            da: "Sporet arbejdsfil: underlagt commits, forgreninger og flettekonflikter.",
          },
        },
        {
          id: "folder-cmd",
          name: "cmd",
          type: "folder",
          children: [
            {
              id: "git-main-go",
              name: "main.go",
              type: "file",
              icon: "code",
              badge: "CLI",
              codeSnippet: {
                csharp: `// Git CLI wrapper`,
                go: `package main

import (
    "fmt"
    "github.com/iwannabesmart/git-core/storage"
)

func main() {
    repo := storage.OpenRepository(".git")
    commitSha := repo.Commit("Initial commit")
    fmt.Printf("[main %s] %s\n", commitSha[:7], "Initial commit")
}`,
              },
              description: {
                ua: "Точка входу Git CLI: ініціює команду коміту та взаємодіє з графом репозиторію.",
                en: "Git CLI entrypoint: initiates commit and coordinates graph mutations.",
                da: "Git CLI startpunkt.",
              },
            },
          ],
        },
        {
          id: "folder-storage",
          name: "storage",
          type: "folder",
          children: [
            {
              id: "git-object-store-go",
              name: "object_store.go",
              type: "file",
              icon: "data",
              badge: "Blobs",
              codeSnippet: {
                csharp: `// Object Store`,
                go: `package storage

import (
    "crypto/sha1"
    "encoding/hex"
)

type ObjectStore struct{}

func (s *ObjectStore) WriteBlob(data []byte) string {
    hash := sha1.Sum(data)
    return hex.EncodeToString(hash[:])
}`,
              },
              description: {
                ua: "Сховище об'єктів (.git/objects): адресоване за вмістом сховище незмінних блобів та дерев.",
                en: "Object Store (.git/objects): content-addressable storage for immutable blobs and trees.",
                da: "Objektlager for uforanderlige blobs.",
              },
            },
          ],
        },
        {
          id: "folder-refs",
          name: "refs",
          type: "folder",
          children: [
            {
              id: "git-ref-go",
              name: "ref.go",
              type: "file",
              icon: "interface",
              badge: "Branch Pointer",
              codeSnippet: {
                csharp: `// Ref Store`,
                go: `package storage

import "os"

type RefStore struct{}

func (r *RefStore) UpdateHead(newCommitSha string) error {
    return os.WriteFile(".git/refs/heads/main", []byte(newCommitSha), 0644)
}`,
              },
              description: {
                ua: "Менеджер посилань (.git/refs): оновлює покажчик гілки на новий SHA коміту.",
                en: "Reference manager (.git/refs): updates branch pointer to new commit SHA.",
                da: "Referencehåndtering.",
              },
            },
          ],
        },
      ],
    },
  ];

  // Cyber Bandit project files
  const banditFiles: ProjectFile[] = [
    {
      id: "solution-root-bandit",
      name: "BanditCyberLab",
      type: "folder",
      children: [
        {
          id: "env-file",
          name: ".env",
          type: "file",
          icon: "config",
          badge: "Secrets",
          codeSnippet: {
            csharp: `API_SECRET=super_secret_production_key_vault_992
DATABASE_URL=Server=127.0.0.1;Port=5432;Database=bandit;`,
            go: `API_SECRET=super_secret_production_key_vault_992
DATABASE_URL=Server=127.0.0.1;Port=5432;Database=bandit;`,
          },
          description: {
            ua: "Змінні середовища: безпечне сховище секретів, яке ніколи не має потрапляти у Git репозиторій.",
            en: "Environment secrets file: safe credential storage protected from source code repository commits.",
            da: "Miljøvariabler: sikker hemmelighedsopbevaring adskilt fra versionsstyring.",
          },
        },
        {
          id: "folder-middleware",
          name: "Middleware",
          type: "folder",
          children: [
            {
              id: "security-filter-cs",
              name: codeLang === "csharp" ? "SecurityFilter.cs" : "filter.go",
              type: "file",
              icon: "driver",
              badge: "Filter",
              codeSnippet: {
                csharp: `namespace BanditLab.Security;

using System.Text.RegularExpressions;

public class SecurityFilter
{
    public bool InspectPayload(string raw)
    {
        if (Regex.IsMatch(raw, @"OR\s+'1'='1'"))
        {
            throw new SecurityBreachException("SQL Injection detected");
        }
        return true;
    }
}`,
                go: `package security

import "regexp"

type SecurityFilter struct{}

func (f *SecurityFilter) InspectPayload(raw string) bool {
    matched, _ := regexp.MatchString("OR\\s+'1'='1'", raw)
    return !matched
}`,
              },
              description: {
                ua: "Фільтр безпеки: евристичний аналізатор вхідного трафіку на SQL Injection та XSS атаки.",
                en: "Security Filter: heuristic analyzer detecting SQL Injection and XSS vectors.",
                da: "Sikkerhedsfilter til inspektion af skadelig kode.",
              },
            },
          ],
        },
        {
          id: "program-cs",
          name: codeLang === "csharp" ? "SecurityMiddleware.cs" : "middleware.go",
          type: "file",
          icon: "code",
          badge: "Firewall",
          codeSnippet: {
            csharp: `using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;

namespace BanditLab.Security;

// Defense in depth security pipeline
${currentCode}`,
            go: `package security

import (
    "crypto/hmac"
    "crypto/sha256"
    "net/http"
)

// Defense in depth security pipeline
${currentCode}`,
          },
          description: {
            ua: "Конвеєр безпеки: перевірка HMAC підписів, лімітування запитів та захист від атак ін'єкцій.",
            en: "Defense middleware pipeline: HMAC verification, rate limiting, and SQL injection barriers.",
            da: "Sikkerhedsmiddleware: HMAC-verifikation og hastighedsbegrænsning.",
          },
        },
      ],
    },
  ];

  // Vertex AI project files
  const vertexFiles: ProjectFile[] = [
    {
      id: "solution-root",
      name: "VertexMLSolution",
      type: "folder",
      children: [
        {
          id: "pipeline-spec",
          name: "pipeline_spec.yaml",
          type: "file",
          icon: "config",
          badge: "YAML Spec",
          codeSnippet: {
            yaml: `pipeline:
  name: retail-mlops-production
  project: gcp-corp-prod
  region: us-central1
  gcs_bucket: gs://retail-training-data
  compute:
    machine_type: a2-highgpu-1g
    accelerator: NVIDIA_TESLA_A100
  serving:
    min_replicas: 2
    max_replicas: 10
    drift_threshold: 0.10`,
            python: `# Pipeline configuration mapping
PIPELINE_CONFIG = {
    "project": "gcp-corp-prod",
    "region": "us-central1",
    "gcs_bucket": "gs://retail-training-data",
    "accelerator": "NVIDIA_TESLA_A100",
}`,
          },
          description: {
            ua: "Конфігурація MLOps конвеєра: декларативний опис ресурсів, параметрів прискорювачів та лімітів автоскейлінгу.",
            en: "MLOps pipeline declaration: declarative hardware provisioning, accelerator sizing, and auto-scaling constraints.",
            da: "MLOps pipeline-konfiguration: deklarativ ressourcetildeling og autoskalering.",
          },
        },
        {
          id: "requirements-txt",
          name: "requirements.txt",
          type: "file",
          icon: "config",
          badge: "Pip",
          codeSnippet: {
            python: `google-cloud-aiplatform>=1.38.0
google-cloud-storage>=2.14.0
kfp>=2.6.0
scikit-learn>=1.4.0
torch>=2.2.0`,
            yaml: `dependencies:
  - google-cloud-aiplatform>=1.38.0
  - kfp>=2.6.0`,
          },
          description: {
            ua: "Залежності контейнера: бібліотеки Google Cloud AI Platform, Kubeflow SDK та PyTorch.",
            en: "Container dependencies: Google Cloud AI Platform SDK, Kubeflow Pipelines, and tensor runtimes.",
            da: "Container-afhængigheder: Google Cloud AI Platform og Kubeflow Pipelines.",
          },
        },
        {
          id: "program-cs",
          name: codeLang === "yaml" ? "vertex_pipeline.yaml" : "pipeline.py",
          type: "file",
          icon: "code",
          badge: "Vertex ML",
          codeSnippet: {
            python: `import os
from google.cloud import aiplatform
from kfp import dsl

# Google Vertex AI Cloud MLOps Architecture
${currentCode}`,
            yaml: `# Google Cloud Pipeline Spec
apiVersion: vertex.ai/v1
kind: PipelineJob
metadata:
  name: dynamic-training-run
spec:
${currentCode}`,
          },
          description: {
            ua: "Головний файл конвеєра: завантаження даних з GCS, навчання на GPU/TPU, деплой на Endpoint та захист VPC.",
            en: "Core pipeline script: GCS data lake ingestion, distributed GPU training, and secure serving deployment.",
            da: "Hovedpipeline: GCS dataindlæsning, distribueret GPU-træning og sikker udrulning.",
          },
        },
      ],
    },
  ];

  // FDE project files
  const fdeFiles: ProjectFile[] = [
    {
      id: "solution-root",
      name: "AppliedAISolution",
      type: "folder",
      children: [
        {
          id: "package-json",
          name: "package.json",
          type: "file",
          icon: "config",
          badge: "npm",
          codeSnippet: {
            typescript: `{
  "name": "enterprise-applied-ai-agent",
  "version": "1.0.0",
  "dependencies": {
    "@langchain/core": "^0.3.0",
    "axios": "^1.7.0",
    "jose": "^5.2.0"
  }
}`,
            python: `[project]
name = "enterprise-applied-ai-agent"
version = "1.0.0"
dependencies = [
    "langgraph>=0.2.0",
    "httpx>=0.27.0",
    "pydantic>=2.6.0",
]`,
          },
          description: {
            ua: "Маніфест корпоративного ШІ агента: залежності інтеграції, безпеки та оркестрації агентних графів.",
            en: "Enterprise AI Agent manifest: dependencies for legacy integration, zero-trust security, and agent workflows.",
            da: "Enterprise AI Agent manifest: afhængigheder til legacy-integration og sikkerhed.",
          },
        },
        {
          id: "runbook-md",
          name: "SRE_RUNBOOK.md",
          type: "file",
          icon: "interface",
          badge: "Docs",
          codeSnippet: {
            python: `# SRE Emergency Playbook: AI Agent Incident Response
## Incident 1: 5xx Spike on Legacy API
- Action: Failover to fallback cache, inspect connection pool.
## Incident 2: Prompt Injection Detected
- Action: Quarantine session JWT, append hash to SOC2 audit log.`,
            typescript: `# SRE Emergency Playbook: AI Agent Incident Response
## Incident 1: 5xx Spike on Legacy API
- Action: Failover to fallback cache, inspect connection pool.
## Incident 2: Prompt Injection Detected
- Action: Quarantine session JWT, append hash to SOC2 audit log.`,
          },
          description: {
            ua: "Регламент аварій: інструкція для SRE чергових клієнта при збоях агентних ланцюжків та атаках.",
            en: "SRE Runbook: step-by-step procedures for client on-call engineers during agent downtime or anomalies.",
            da: "SRE Beredskabsplan: trinvise procedurer for fejlsøgning og gendannelse.",
          },
        },
        {
          id: "program-cs",
          name: codeLang === "typescript" ? "agent_graph.ts" : "agent_graph.py",
          type: "file",
          icon: "code",
          badge: "Agent Graph",
          codeSnippet: {
            python: `import httpx
import hashlib
from typing import Dict, Any

# Enterprise Forward Deployed AI Agent System
${currentCode}`,
            typescript: `import axios from "axios";
import * as crypto from "crypto";

// Enterprise Forward Deployed AI Agent System
${currentCode}`,
          },
          description: {
            ua: "Бойовий агентний контур: адаптація legacy систем, RAG контекст, валідація прав JWT та запобіжники каскадних відмов.",
            en: "Production agent architecture: legacy adapters, RAG indexing, JWT claim enforcement, and circuit breakers.",
            da: "Produktionsagent: legacy-adaptere, RAG-kontekst og sikring mod kaskadefejl.",
          },
        },
      ],
    },
  ];

  const ragFiles: ProjectFile[] = [
    {
      id: "rag-root",
      name: "ibm-rag-agentic-suite",
      type: "folder",
      children: [
        {
          id: "rag-chunker",
          name: "chunker.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# Recursive Document Chunker with Overlap
def chunk_document(text: str, chunk_size: int = 256, overlap: int = 40) -> list[str]:
    chunks = []
    step = max(1, chunk_size - overlap)
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start += step
    return chunks`,
            typescript: `// Recursive Document Chunker with Overlap
export function chunkDocument(text: string, chunkSize = 256, overlap = 40): string[] {
  const chunks: string[] = [];
  const step = Math.max(1, chunkSize - overlap);
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    if (end >= text.length) break;
    start += step;
  }
  return chunks;
}`,
          },
          description: {
            ua: "Алгоритм нарізки корпоративних документів на чанки з перекриттям контексту.",
            en: "Algorithm slicing corporate documents into chunks with overlapping context.",
            da: "Algoritme til opdeling af virksomhedsdokumenter i chunks med overlappende kontekst.",
          },
        },
        {
          id: "rag-vectorstore",
          name: "vector_store.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# In-Memory Vector Store & Cosine Similarity
import math

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot_product / (mag_a * mag_b)`,
            typescript: `// In-Memory Vector Store & Cosine Similarity
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dotProduct / denom;
}`,
          },
          description: {
            ua: "Математичне ядро векторного сховища: скалярний добуток та косинусний кут між ембеддингами.",
            en: "Mathematical core of vector store: dot product and cosine angle between embeddings.",
            da: "Matematisk kerne for vektorlager: prikprodukt og cosinusvinkel mellem embeddings.",
          },
        },
        {
          id: "rag-react-agent",
          name: "react_agent.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# ReAct Loop State Machine: Thought -> Action -> Observation
class ReActAgent:
    def __init__(self, tool_registry: dict, max_steps: int = 3):
        self.tools = tool_registry
        self.max_steps = max_steps
${currentCode}`,
            typescript: `// ReAct Loop State Machine: Thought -> Action -> Observation
export class ReActAgent {
  constructor(private tools: Record<string, Function>, private maxSteps = 3) {}
}
${currentCode}`,
          },
          description: {
            ua: "Агентний цикл міркування: декомпозиція запиту, виклик інструментів та синтез підтвердженої відповіді.",
            en: "Agent reasoning loop: intent decomposition, tool calling, and grounded response synthesis.",
            da: "Agent ræsonneringscyklus: dekomponering, værktøjskald og syntese af bekræftet svar.",
          },
        },
      ],
    },
  ];

  const cyberFiles: ProjectFile[] = [
    {
      id: "cyber-root",
      name: "GoogleCyberSoc",
      type: "folder",
      children: [
        {
          id: "cyber-syslog",
          name: "syslog_parser.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# RFC 5424 / RFC 3164 Syslog Parser for Chronicle SIEM
import re

def parse_syslog_line(raw_line: str) -> dict:
    ip_match = re.search(r"\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", raw_line)
    source_ip = ip_match.group(0) if ip_match else "127.0.0.1"
    severity = "CRITICAL" if "exploit" in raw_line.lower() else "HIGH" if "failed" in raw_line.lower() else "INFO"
    return {"source_ip": source_ip, "severity": severity}`,
            typescript: `// RFC 5424 / RFC 3164 Syslog Parser for Chronicle SIEM
export function parseSyslog(raw: string) {
  const ipMatch = raw.match(/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/);
  return {
    sourceIp: ipMatch ? ipMatch[0] : "127.0.0.1",
    severity: raw.toLowerCase().includes("exploit") ? "CRITICAL" : raw.toLowerCase().includes("failed") ? "HIGH" : "INFO"
  };
}`,
          },
          description: {
            ua: "Парсер журналів безпеки: структуризація сирих syslog-рядків для SIEM аналітики.",
            en: "Security log parser: structures raw syslog lines for SIEM threat analysis.",
            da: "Sikkerhedslogparser: strukturerer rå syslog-linjer til SIEM-trusselsanalyse.",
          },
        },
        {
          id: "cyber-wireshark",
          name: "packet_dissector.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# Web-Wireshark Packet Dissector & Anomaly Detector
def dissect_pcap_frame(raw_bytes: bytes) -> dict:
    # Ethernet header: 14 bytes, IPv4: 20 bytes, TCP: 20 bytes
    flags = {"syn": True, "ack": False}
    return {
        "source_ip": "192.168.1.105",
        "is_syn_initiation": flags["syn"] and not flags["ack"],
        "payload_len": len(raw_bytes)
    }`,
            typescript: `// Web-Wireshark Packet Dissector & Anomaly Detector
export function dissectPacket(frame: any) {
  const flags = frame.flags || {};
  return {
    sourceIp: frame.sourceIp,
    isSynInitiation: Boolean(flags.syn && !flags.ack),
    payloadLen: frame.length || 0
  };
}`,
          },
          description: {
            ua: "Дисектор пакетів: перевірка заголовків Ethernet, IPv4, TCP прапорців та виявлення аномалій (SYN Flood).",
            en: "Packet dissector: inspects Ethernet, IPv4, TCP flags, and flags anomalies like SYN Flood.",
            da: "Pakkedissektor: inspicerer Ethernet, IPv4, TCP-flag og identificerer anomalier som SYN Flood.",
          },
        },
        {
          id: "cyber-chronicle",
          name: "chronicle_engine.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# Google Chronicle SIEM Rules Engine & MITRE ATT&CK Mapper
def evaluate_mitre(event: dict) -> dict:
    if event.get("syn_ratio", 0) > 10.0:
        return {"id": "T1499", "name": "Endpoint Denial of Service", "tactic": "Impact"}
    return {"id": "T1110", "name": "Brute Force", "tactic": "Credential Access"}`,
            typescript: `// Google Chronicle SIEM Rules Engine & MITRE ATT&CK Mapper
export function evaluateMitre(event: any) {
  if (event.synRatio > 10.0) {
    return { id: "T1499", name: "Endpoint Denial of Service", tactic: "Impact" };
  }
  return { id: "T1110", name: "Brute Force", tactic: "Credential Access" };
}`,
          },
          description: {
            ua: "Движок правил Chronicle SIEM: зіставлення мережевих подій з матрицею загроз MITRE ATT&CK.",
            en: "Chronicle SIEM rules engine: maps security telemetry against MITRE ATT&CK adversary tactics.",
            da: "Chronicle SIEM-regelmotor: kortlægger hændelser til MITRE ATT&CK matricen.",
          },
        },
        {
          id: "cyber-nist",
          name: "nist_containment.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# NIST SP 800-61 Rev 2 / NIST CSF 2.0 Containment Machine
class NistContainmentMachine:
    def advance_stage(self, incident_id: str) -> str:
        # Phase progression: IDENTIFY -> PROTECT -> DETECT -> RESPOND -> RECOVER
        return "CONTAINMENT"`,
            typescript: `// NIST SP 800-61 Rev 2 / NIST CSF 2.0 Containment Machine
export class NistContainmentMachine {
  advanceStage(incidentId: string): string {
    return "CONTAINMENT";
  }
}`,
          },
          description: {
            ua: "Протокол реагування на інциденти: реалізація фази Containment за стандартом NIST CSF.",
            en: "Incident response workflow: executes containment protocols under NIST CSF 2.0 guidelines.",
            da: "Hændelsesrespons-workflow: udfører indæmningsprotokoller under NIST CSF.",
          },
        },
        {
          id: "cyber-firewall",
          name: "firewall_manager.py",
          type: "file",
          icon: "code",
          codeSnippet: {
            python: `# Linux Kernel Netfilter / iptables Firewall Enforcement
def apply_iptables_drop(source_ip: str) -> dict:
    rule = f"iptables -A INPUT -s {source_ip} -j DROP"
    return {"status": 200, "enforced_rule": rule, "action": "DROP"}`,
            typescript: `// Linux Kernel Netfilter / iptables Firewall Enforcement
export function applyIptablesDrop(sourceIp: string) {
  return {
    status: 200,
    enforcedRule: \`iptables -A INPUT -s \${sourceIp} -j DROP\`,
    action: "DROP"
  };
}`,
          },
          description: {
            ua: "Автоматизація блокування загроз: генерація правил Netfilter iptables для ізоляції зловмисника.",
            en: "Threat mitigation engine: generates kernel-level iptables rules to drop adversary traffic.",
            da: "Trusselsisolering: genererer iptables-regler for at blokere angriberens trafik.",
          },
        },
      ],
    },
  ];

  if (activeStation === "cyber") return cyberFiles;
  if (activeStation === "rag") return ragFiles;
  if (activeStation === "vertex") return vertexFiles;
  if (activeStation === "fde") return fdeFiles;
  if (activeStation === "api") return apiFiles;
  if (activeStation === "git") return gitFiles;
  if (activeStation === "bandit") return banditFiles;
  if (isFintech || activeStation === "pos") return fintechFiles;
  return tvFiles;
}

/**
 * Recursively collects all leaf file items from a hierarchical ProjectFile tree.
 */
export function flattenProjectFiles(items: ProjectFile[]): ProjectFile[] {
  const result: ProjectFile[] = [];
  for (const item of items) {
    if (item.type === "file") {
      result.push(item);
    }
    if (item.children && item.children.length > 0) {
      result.push(...flattenProjectFiles(item.children));
    }
  }
  return result;
}


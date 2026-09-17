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
    csharp: string;
    go: string;
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
};

export function getStationProjectFiles(
  activeStation: string,
  isFintech: boolean,
  codeLang: "csharp" | "go",
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
          id: "tv-hardware-driver",
          name: codeLang === "csharp" ? "TV.cs" : "tv.go",
          type: "file",
          icon: "driver",
          badge: "Hardware",
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

  if (activeStation === "api") return apiFiles;
  if (activeStation === "git") return gitFiles;
  if (activeStation === "bandit") return banditFiles;
  if (isFintech || activeStation === "pos") return fintechFiles;
  return tvFiles;
}

/**
 * @file apps/web/src/components/workbench/playground/ProjectExplorerBar.tsx
 * @description Interactive Project Explorer and Blueprint Solution Drawer.
 *              Demystifies the "magic one-liner" global scope by showing real project
 *              structure (.csproj, classes, Main entrypoint, Heap/Stack allocation).
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderTree,
  FileCode,
  FileText,
  ChevronRight,
  Layers,
  Cpu,
  X,
  Database,
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";
import { useWorkbenchStore } from "../../../store/workbenchStore";

interface ProjectFile {
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

interface ProjectExplorerBarProps {
  currentCode?: string;
  codeLang?: "csharp" | "go";
  isFintech?: boolean;
  className?: string;
  stationId?: string;
}

export const ProjectExplorerBar: React.FC<ProjectExplorerBarProps> = ({
  currentCode = "// tv.PowerOn();",
  codeLang = "csharp",
  isFintech = false,
  className = "",
  stationId,
}) => {
  const { t, i18n } = useTranslation();
  const currentStationId = useWorkbenchStore((s) => s.currentStationId);
  const currentLang = (i18n.language?.startsWith("da")
    ? "da"
    : i18n.language?.startsWith("en")
    ? "en"
    : "ua") as "ua" | "en" | "da";

  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>("program-cs");

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
          badge: "Defense",
          codeSnippet: {
            csharp: `using System.Security.Cryptography;
using Microsoft.AspNetCore.Http;

namespace SecurityApp;

public class SecurityMiddleware
{
    public static void Configure(WebApplication app)
    {
${currentCode}
    }
}`,
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

  const activeStation = stationId || currentStationId;

  const rootFolder =
    activeStation === "api"
      ? apiFiles[0]
      : activeStation === "git"
      ? gitFiles[0]
      : activeStation === "bandit"
      ? banditFiles[0]
      : isFintech || activeStation === "pos"
      ? fintechFiles[0]
      : tvFiles[0];

  const allFiles = rootFolder.children || [];

  const selectedFile =
    allFiles.find((f) => f.id === selectedFileId) || allFiles[1] || allFiles[0];

  const handleOpenModal = () => {
    audioFx.playRelayClick();
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    audioFx.playRelayClick();
    setIsOpen(false);
  };

  const handleSelectFile = (id: string) => {
    audioFx.playKeyClick();
    setSelectedFileId(id);
  };

  return (
    <>
      {/* ── Top Inlined Breadcrumbs & Solution Explorer Trigger ── */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0A0E17] text-xs font-mono select-none shadow-sm ${className}`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-slate-400">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
            {rootFolder.name}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            {codeLang === "csharp" ? "Program.cs" : "main.go"}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
            {codeLang === "csharp" ? "entrypoint" : "package main"}
          </span>
        </div>

        <button
          onClick={handleOpenModal}
          title={t("playground.solutionExplorer", "Оглядач проєкту")}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 text-[11px] font-bold font-mono transition-all active:scale-95 cursor-pointer ml-2 shrink-0 shadow-sm"
        >
          <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t("playground.solutionExplorer", "Оглядач проєкту")}</span>
        </button>
      </div>

      {/* ── Blueprint Solution Drawer / Modal (SOLID 100% OPAQUE BACKGROUND) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/95 backdrop-blur-md animate-in fade-in duration-200 font-sans">
          <div className="relative w-full max-w-5xl h-[85vh] max-h-[720px] rounded-2xl border-2 border-slate-700/80 bg-[#0B0E14] shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-slate-100 isolate">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#161D27]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{rootFolder.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                      {codeLang === "csharp" ? "C# (.NET 9.0)" : "Go 1.23"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    {t(
                      "playground.inspectArchitecture",
                      "Архітектура та файли реального комерційного проєкту"
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: 2-column layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#0B0E14]">
              {/* Left Column: File Tree */}
              <div className="md:col-span-4 border-r border-slate-800 p-3 bg-[#0D1117] overflow-y-auto space-y-1">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                  <span>FILES & CLASSES</span>
                  <span className="text-[10px] text-emerald-400">SOLUTION EXPLORER</span>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  {allFiles.map((file) => {
                    const isSelected = file.id === selectedFile.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => handleSelectFile(file.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-950/70 text-emerald-300 font-bold border border-emerald-600/60 shadow-sm"
                            : "hover:bg-[#161D27] text-slate-300 border border-transparent hover:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {file.icon === "config" ? (
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : file.icon === "interface" ? (
                            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                          ) : file.icon === "data" ? (
                            <Database className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                          <span className="truncate">{file.name}</span>
                        </div>
                        {file.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                              file.badge === "Main()" || file.badge === "Endpoints"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {file.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Educational Callout inside File Tree */}
                <div className="mt-4 p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 text-xs space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {activeStation === "api"
                        ? "Зняття ілюзії магічного коду (ASP.NET / Go HTTP):"
                        : activeStation === "pos"
                        ? "Зняття ілюзії магічного коду (POS Terminal):"
                        : activeStation === "git"
                        ? "Зняття ілюзії магічного коду (Git DAG Engine):"
                        : activeStation === "bandit"
                        ? "Зняття ілюзії магічного коду (Cyber Defense Pipeline):"
                        : "Зняття ілюзії магічного коду:"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/90">
                    {activeStation === "api"
                      ? "Усі ендпоінти реєструються у конвеєрі Kestrel/net/http всередині точки входу. Жоден маршрут не висить у повітрі."
                      : activeStation === "pos"
                      ? "Транзакційний цикл касира виконується всередині сесії CashierSession з перевіркою інваріантів рахунку."
                      : activeStation === "git"
                      ? "Команди git маніпулюють об'єктами у сховищі .git та вказівником HEAD, формуючи ациклічний граф (DAG)."
                      : activeStation === "bandit"
                      ? "SecurityMiddleware перехоплює вхідний потік байтів до потрапляння в контролер, блокуючи ін'єкції та атаки."
                      : t(
                          "playground.entrypointHint",
                          "Усі команди виконуються всередині точки входу Main(). Жоден рядок не існує у вакуумі."
                        )}
                  </p>
                  <p className="text-[10px] text-amber-300/80 font-mono">
                    {activeStation === "api"
                      ? "Results.Ok(...) виділяє пам'ять для JSON-відповіді в Heap, а сокет відправляє байти клієнту."
                      : activeStation === "pos"
                      ? "Сума balance та статус транзакції зберігаються у Heap терміналу."
                      : activeStation === "git"
                      ? "HEAD посилається на хеш останнього коміту у дереві ревізій."
                      : activeStation === "bandit"
                      ? "Криптографічні ключі та токени зберігаються в захищеній пам'яті процесу, запобігаючи витоку через стек або логи."
                      : t(
                          "playground.heapAllocationHint",
                          "TV tv = new TV(); виділяє пам'ять у Heap, посилання живе у Stack."
                        )}
                  </p>
                </div>
              </div>

              {/* Right Column: Code Viewer & Context Explanation */}
              <div className="md:col-span-8 flex flex-col overflow-hidden bg-[#06090E]">
                {/* File Header Tab */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#161D27] font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    UTF-8 • {codeLang.toUpperCase()}
                  </span>
                </div>

                {/* Code Container (Solid opaque dark background) */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed bg-[#05080E] text-emerald-300 select-text border-b border-slate-800">
                  <pre className="whitespace-pre-wrap">
                    <code>
                      {codeLang === "csharp"
                        ? selectedFile?.codeSnippet?.csharp ?? ""
                        : selectedFile?.codeSnippet?.go ?? ""}
                    </code>
                  </pre>
                </div>

                {/* File Didactic Summary Footer */}
                <div className="p-3 bg-[#131922] text-xs text-slate-300 flex items-center justify-between font-sans">
                  <span className="leading-relaxed">
                    {selectedFile?.description?.[currentLang] || selectedFile?.description?.ua || ""}
                  </span>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs transition-all cursor-pointer shrink-0 ml-3"
                  >
                    Зрозуміло
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

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
} from "lucide-react";
import { audioFx } from "../../../utils/audioFx";

interface ProjectFile {
  id: string;
  name: string;
  type: "file" | "folder";
  icon?: "code" | "config" | "interface" | "driver";
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
}

export const ProjectExplorerBar: React.FC<ProjectExplorerBarProps> = ({
  currentCode = "// tv.PowerOn();",
  codeLang = "csharp",
  isFintech = false,
  className = "",
}) => {
  const { t, i18n } = useTranslation();
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
using SmartTvApp.Core;

namespace SmartTvApp;

public class Program
{
    // 📍 ТОЧКА ВХОДУ: Увесь ваш код компілюється та виконується всередині Main()
    public static void Main(string[] args)
    {
        // 💾 КУПА (Heap): Виділяється блок пам'яті під об'єкт VirtualTV
        // 📚 СТЕК (Stack): Змінна 'tv' зберігає 64-бітну адресу пам'яті
        VirtualTV tv = new VirtualTV();

        // ═══════════════════════════════════════════════
        // ⚡ ВАШ КОД ВИКОНУЄТЬСЯ ТУТ:
        // ═══════════════════════════════════════════════
${currentCode
  .split("\n")
  .map((line) => "        " + line)
  .join("\n")}
        // ═══════════════════════════════════════════════

        Console.WriteLine($"[RUNTIME OK] Device state: IsOn={tv.IsOn}, Channel={tv.Channel}");
    }
}`,
            go: `package main

import (
    "fmt"
    "github.com/iwannabesmart/tv-core/core"
)

// 📍 ТОЧКА ВХОДУ: main() запускає горутину керування приладом
func main() {
    // 💾 СТРУКТУРА: виділяється екземпляр VirtualTV у пам'яті
    tv := core.NewVirtualTV()

    // ═══════════════════════════════════════════════
    // ⚡ ВАШ КОД ВИКОНУЄТЬСЯ ТУТ:
    // ═══════════════════════════════════════════════
${currentCode
  .split("\n")
  .map((line) => "    " + line)
  .join("\n")}
    // ═══════════════════════════════════════════════

    fmt.Printf("[RUNTIME OK] State: IsOn=%v, Channel=%d\\n", tv.IsOn, tv.Channel)
}`,
          },
          description: {
            ua: "Головна точка входу консольного додатку. Знімає ілюзію «магічного рядка»: кожна інструкція насправді працює всередині методу Main() на стеку викликів.",
            en: "Primary entrypoint of the application. Demystifies magic one-liners: all code executes within static void Main() inside a call stack frame.",
            da: "Hovedindgangspunkt for applikationen: al kode eksekveres inden i Main() på kaldestakken.",
          },
        },
        {
          id: "virtual-tv-cs",
          name: codeLang === "csharp" ? "VirtualTv.cs" : "tv.go",
          type: "file",
          icon: "code",
          badge: "Class",
          codeSnippet: {
            csharp: `namespace SmartTvApp.Core;

public class VirtualTV
{
    // Поля стану в оперативній пам'яті (Heap fields)
    private bool _isOn = false;
    private int _channel = 1;
    private int _volume = 10;
    private int _brightness = 50;
    private bool _isFuseBlown = false;

    public bool IsOn => _isOn;
    public int Channel => _channel;
    public int Brightness => _brightness;

    public void PowerOn() => _isOn = true;
    public void PowerOff() => _isOn = false;

    public void SetChannel(int ch)
    {
        if (!_isOn) throw new InvalidOperationException("Device is OFF");
        _channel = ch;
    }

    public void SetBrightness(int b)
    {
        if (b > 100)
        {
            _isFuseBlown = true;
            throw new Exception("CATHODE_RAY_OVERLOAD: Safety fuse tripped!");
        }
        _brightness = b;
    }
}`,
            go: `package core

import "errors"

type VirtualTV struct {
    IsOn         bool
    Channel      int
    Volume       int
    Brightness   int
    IsFuseBlown  bool
}

func NewVirtualTV() *VirtualTV {
    return &VirtualTV{Channel: 1, Volume: 10, Brightness: 50}
}

func (tv *VirtualTV) PowerOn() { tv.IsOn = true }
func (tv *VirtualTV) SetChannel(ch int) error {
    if !tv.IsOn { return errors.New("device is OFF") }
    tv.Channel = ch
    return nil
}`,
          },
          description: {
            ua: "Клас моделі телевізора: інкапсулює апаратний стан (живлення, канал, яскравість) та захищає поля від некоректної мутації.",
            en: "Core domain model class: encapsulates hardware state (power, channel, brightness) and enforces hardware invariants.",
            da: "Domænemodelklasse: indkapsler hardwaretilstand og håndhæver systeminvarianter.",
          },
        },
        {
          id: "iremotecmd-cs",
          name: codeLang === "csharp" ? "IRemoteCommand.cs" : "command.go",
          type: "file",
          icon: "interface",
          badge: "Interface",
          codeSnippet: {
            csharp: `namespace SmartTvApp.Core;

// 🔌 КОНТРАКТ: Будь-яка кнопка пульта або плагін реалізує цей інтерфейс
public interface IRemoteCommand
{
    void Execute();
}

public class PowerCommand : IRemoteCommand
{
    private readonly VirtualTV _tv;
    public PowerCommand(VirtualTV tv) => _tv = tv;
    public void Execute() => _tv.PowerOn();
}`,
            go: `package core

// 🔌 ІНТЕРФЕЙСНИЙ КОНТРАКТ у Go
type IRemoteCommand interface {
    Execute()
}

type PowerCommand struct {
    Tv *VirtualTV
}

func (c PowerCommand) Execute() {
    c.Tv.PowerOn()
}`,
          },
          description: {
            ua: "Контракт інтерфейсу (Патерн Команда): дозволяє пульту викликати Execute() без знання того, яка саме команда підключена.",
            en: "Interface contract (Command Pattern): enables dynamic polymorphic dispatch via Execute() without tight coupling.",
            da: "Grænsefladekontrakt (Command Pattern): muliggør polymorf eksekvering uden tæt kobling.",
          },
        },
      ],
    },
  ];

  // Fintech project files
  const fintechFiles: ProjectFile[] = [
    {
      id: "solution-root-pos",
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
            go: `module github.com/iwannabesmart/pos-core\n\ngo 1.23`,
          },
          description: {
            ua: "Конфігурація фінансового термінала з підвищеними вимогами до безпеки типів.",
            en: "Fintech terminal configuration with strict type safety constraints.",
            da: "Fintech terminalkonfiguration med strenge typesikkerhedskrav.",
          },
        },
        {
          id: "pos-program-cs",
          name: codeLang === "csharp" ? "Program.cs" : "main.go",
          type: "file",
          icon: "code",
          badge: "Main()",
          codeSnippet: {
            csharp: `using System;
using PosApp.Security;
using PosApp.Gateways;

namespace PosApp;

public class Program
{
    // 📍 ТОЧКА ВХОДУ: Обробка платіжної транзакції
    public static void Main(string[] args)
    {
        decimal balance = 1000.0m;
        decimal amount = 200.0m;
        string status = "IDLE";

        // ═══════════════════════════════════════════════
        // ⚡ ВАШ КОД БІЗНЕС-ПРОЦЕСИНГУ:
        // ═══════════════════════════════════════════════
${currentCode
  .split("\n")
  .map((line) => "        " + line)
  .join("\n")}
        // ═══════════════════════════════════════════════

        Console.WriteLine($"[LEDGER AUDIT] Final Balance: {balance:C2}, Status: {status}");
    }
}`,
            go: `package main

import "fmt"

func main() {
    balance := 1000.0
    amount := 200.0
    status := "IDLE"

    // ⚡ ВАШ КОД БІЗНЕС-ПРОЦЕСИНГУ:
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

  const rootFolder = isFintech ? fintechFiles[0] : tvFiles[0];
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
        className={`flex items-center justify-between px-3 py-1.5 rounded-xl border border-border/40 bg-card/60 backdrop-blur-md text-xs font-mono select-none ${className}`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-muted-foreground">
          <span className="text-primary/90 font-bold flex items-center gap-1">
            <FolderTree className="w-3.5 h-3.5" />
            {isFintech ? "PosSolution" : "SmartTvSolution"}
          </span>
          <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
          <span className="text-foreground font-semibold flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            {codeLang === "csharp" ? "Program.cs" : "main.go"}
          </span>
          <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
            {codeLang === "csharp" ? "static void Main(args)" : "func main()"}
          </span>
        </div>

        <button
          onClick={handleOpenModal}
          title={t("playground.solutionExplorer", "Оглядач проєкту")}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-[11px] font-bold font-mono transition-all active:scale-95 cursor-pointer ml-2 shrink-0"
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>{t("playground.solutionExplorer", "Оглядач проєкту")}</span>
        </button>
      </div>

      {/* ── Blueprint Solution Drawer / Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[85vh] max-h-[720px] rounded-2xl border border-border/80 bg-card shadow-2xl flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-foreground flex items-center gap-2">
                    <span>{rootFolder.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {codeLang === "csharp" ? "C# (.NET 9.0)" : "Go 1.23"}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "playground.inspectArchitecture",
                      "Архітектура та файли реального комерційного проєкту"
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg hover:bg-muted border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: 2-column layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Left Column: File Tree */}
              <div className="md:col-span-4 border-r border-border/60 p-3 bg-muted/10 overflow-y-auto space-y-1">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center justify-between">
                  <span>FILES & CLASSES</span>
                  <span className="text-[10px] text-primary">SOLUTION EXPLORER</span>
                </div>

                <div className="space-y-0.5 font-mono text-xs">
                  {allFiles.map((file) => {
                    const isSelected = file.id === selectedFile.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => handleSelectFile(file.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/15 text-primary font-bold border border-primary/30 shadow-xs"
                            : "hover:bg-muted/50 text-foreground/80 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {file.icon === "config" ? (
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : file.icon === "interface" ? (
                            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                          ) : (
                            <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                          )}
                          <span className="truncate">{file.name}</span>
                        </div>
                        {file.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                              file.badge === "Main()"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-muted text-muted-foreground"
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
                <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Зняття ілюзії магічного коду:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/90">
                    {t(
                      "playground.entrypointHint",
                      "Усі команди виконуються всередині точки входу Main(). Жоден рядок не існує у вакуумі."
                    )}
                  </p>
                  <p className="text-[10px] text-amber-300/80 font-mono">
                    {t(
                      "playground.heapAllocationHint",
                      "TV tv = new TV(); виділяє пам'ять у Heap, посилання живе у Stack."
                    )}
                  </p>
                </div>
              </div>

              {/* Right Column: Code Viewer & Context Explanation */}
              <div className="md:col-span-8 flex flex-col overflow-hidden bg-background/50">
                {/* File Header Tab */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-muted/20 font-mono text-xs">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <FileCode className="w-4 h-4 text-primary" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    UTF-8 • {codeLang.toUpperCase()}
                  </span>
                </div>

                {/* Code Container */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed bg-black/40 text-emerald-300 select-text">
                  <pre className="whitespace-pre-wrap">
                    <code>
                      {codeLang === "csharp"
                        ? selectedFile?.codeSnippet?.csharp ?? ""
                        : selectedFile?.codeSnippet?.go ?? ""}
                    </code>
                  </pre>
                </div>

                {/* File Didactic Summary Footer */}
                <div className="p-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
                  <span className="leading-relaxed">
                    {selectedFile?.description?.[currentLang] || selectedFile?.description?.ua || ""}
                  </span>
                  <button
                    onClick={handleCloseModal}
                    className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold font-mono text-xs hover:bg-primary/90 transition-all cursor-pointer shrink-0 ml-3"
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

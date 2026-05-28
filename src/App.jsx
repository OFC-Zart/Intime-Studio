import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Heart, ShieldCheck, Sparkles, RotateCcw } from "lucide-react";
function Button({ children, className = "", disabled = false, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`${className} ${disabled ? "cursor-not-allowed" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

const prizes = [
  {
    label: "5% OFF",
    description: "Um carinho especial para deixar sua compra ainda melhor.",
    weight: 35,
  },
  {
    label: "15% OFF",
    description: "Um desconto apaixonante para celebrar o amor.",
    weight: 18,
  },
  {
    label: "Brinde na próxima compra",
    description: "O prêmio mais especial da roleta. Guarde seu print!",
    weight: 6,
  },
  {
    label: "Raspadinha do amor",
    description: "Uma surpresa extra para deixar a experiência mais divertida.",
    weight: 16,
  },
  {
    label: "Tente novamente",
    description: "Hoje não foi dessa vez, mas o amor sempre dá outra chance.",
    weight: 25,
  },
];

const rouletteColors = [
  "#f5c0b5",
  "#b11226",
  "#8a1020",
  "#d97b6c",
  "#5c0914",
];

function pickWeightedPrize() {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  const randomValue = Math.random() * totalWeight;
  let accumulated = 0;

  for (let index = 0; index < prizes.length; index++) {
    accumulated += prizes[index].weight;
    if (randomValue <= accumulated) return index;
  }

  return prizes.length - 1;
}

function getStoredAttempt() {
  try {
    const resetVersion = "producao-01";
    const savedVersion = localStorage.getItem("valentine_roulette_reset_version");

    if (savedVersion !== resetVersion) {
      localStorage.removeItem("valentine_roulette_attempt");
      localStorage.setItem("valentine_roulette_reset_version", resetVersion);
      return null;
    }

    return localStorage.getItem("valentine_roulette_attempt");
  } catch {
    return null;
  }
}

function setStoredAttempt(result) {
  try {
    localStorage.setItem(
      "valentine_roulette_attempt",
      JSON.stringify({ result, createdAt: new Date().toISOString() })
    );
  } catch {
    // Caso o navegador bloqueie localStorage, o site continua funcionando.
  }
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeSlice(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function splitPrizeLabel(label) {
  if (label === "Brinde na próxima compra") return ["BRINDE NA", "PRÓXIMA COMPRA"];
  if (label === "Raspadinha do amor") return ["RASPADINHA", "DO AMOR"];
  if (label === "Tente novamente") return ["TENTE", "NOVAMENTE"];
  return [label.toUpperCase()];
}

export default function ValentineRouletteSite() {
  const [revealed, setRevealed] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const existingAttempt = getStoredAttempt();
  const [alreadyPlayed, setAlreadyPlayed] = useState(Boolean(existingAttempt));
  const rouletteRef = useRef(null);

  const gradient = useMemo(() => {
    const slice = 360 / prizes.length;
    return prizes
      .map((_, index) => {
        const start = index * slice;
        const end = (index + 1) * slice;
        return `${rouletteColors[index]} ${start}deg ${end}deg`;
      })
      .join(", ");
  }, []);

  function revealGift() {
    if (unlocking || revealed) return;

    setUnlocking(true);

    setTimeout(() => {
      setRevealed(true);
    }, 1200);

    setTimeout(() => {
      setCanAdvance(true);
      rouletteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 2600);
  }

  function spinRoulette() {
    if (spinning || alreadyPlayed) return;

    const selectedIndex = pickWeightedPrize();
    const slice = 360 / prizes.length;
    const centerOfSlice = selectedIndex * slice + slice / 2;
    const extraSpins = 360 * 6;
    const targetRotation = extraSpins - centerOfSlice;

    setSpinning(true);
    setWinnerIndex(null);
    setRotation((previous) => previous + targetRotation);

    setTimeout(() => {
      setWinnerIndex(selectedIndex);
      setSpinning(false);

      const selectedPrize = prizes[selectedIndex];

      if (selectedPrize.label === "Tente novamente") {
        setAlreadyPlayed(false);
        localStorage.removeItem("valentine_roulette_attempt");
      } else {
        setAlreadyPlayed(true);
        setStoredAttempt(selectedPrize.label);
      }

      return;
    }, 4300);
  }

  const winner = winnerIndex !== null ? prizes[winnerIndex] : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#090909] text-[#f6d1c7]">
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-gradient-to-b from-[#050505] via-[#14070b] to-[#26070d] px-4 py-8 md:px-5 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#7c0d1b_0%,transparent_30%),radial-gradient(circle_at_bottom,#35040b_0%,transparent_35%),linear-gradient(180deg,#050505_0%,#16070b_50%,#090909_100%)]" />
        <div className="absolute left-8 top-10 h-28 w-28 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute bottom-16 right-8 h-36 w-36 rounded-full bg-rose-300/30 blur-3xl" />

        <div className={`absolute inset-0 z-0 transition-all duration-700 ${revealed ? "blur-0 opacity-70" : "blur-sm opacity-40"}`}>
          <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 px-6 opacity-60 md:grid-cols-4">
            {[
              "Amor em cada detalhe",
              "Surpresas especiais",
              "Promoção limitada",
              "Dia dos Namorados",
            ].map((text) => (
              <div key={text} className="rounded-3xl border border-white/20 bg-[#fff1ed]/75 p-5 shadow-[0_0_25px_rgba(255,120,120,0.08)] backdrop-blur-xl">
                <Heart className="mb-3 h-5 w-5 text-rose-500" />
                <p className="text-sm font-semibold tracking-[0.02em] text-[#4a0d18] drop-shadow-sm">
                    {text}
                  </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute left-4 top-4 z-20 flex scale-75 origin-top-left items-center gap-3 sm:scale-90 md:left-12 md:top-10 md:scale-100 md:gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#d7a08f] text-3xl font-light text-[#f2b7a7] shadow-[0_0_25px_rgba(255,120,120,0.25)]">
            IS
          </div>
          <div>
            <h2 className="text-3xl font-light tracking-[0.25em] text-[#f2b7a7] md:text-5xl">
              INTIME
            </h2>
            <p className="ml-1 text-sm tracking-[0.6em] text-[#d7a08f] md:text-lg">
              STUDIO
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 z-0 overflow-hidden rounded-tr-[4rem] opacity-70">
          <img
            src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop"
            alt="Rosas decorativas"
            className="h-56 w-44 object-cover object-center blur-[1px] md:h-80 md:w-72"
          />
        </div>

        <div className="absolute bottom-0 right-0 z-0 opacity-50 blur-sm md:opacity-70 md:blur-md">
          <div className="relative mr-2 mb-2 md:mr-6 md:mb-6">
            <Heart
              className="h-32 w-32 fill-[#ff6b88] text-[#ff6b88] drop-shadow-[0_0_35px_rgba(255,80,120,0.45)] sm:h-44 sm:w-44 md:h-64 md:w-64"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 rounded-full bg-[#ff6b88]/25 blur-3xl" />
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-24 max-w-3xl px-2 text-center md:mt-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ffd1c7]/30 bg-[#fff1ed]/85 px-4 py-2 text-sm font-semibold text-[#4a0d18] shadow-[0_0_25px_rgba(255,120,120,0.12)] backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-rose-500" />
              Promoção especial para clientes
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#f5c0b5] drop-shadow-[0_0_25px_rgba(255,110,110,0.35)] sm:text-5xl md:text-7xl">
              Feliz Dia dos Namorados
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#e7b1a4] md:text-lg">
              O amor merece ser celebrado com carinho, surpresa e um toque de sorte. Clique no presente e descubra o mimo que preparamos para você.
            </p>
          </motion.div>

          <div className="mt-10 flex justify-center">
            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.button
                  key="gift"
                  onClick={revealGift}
                  className="group relative h-52 w-52 rounded-[2rem] bg-gradient-to-br from-[#f2b0a0] via-[#b11226] to-[#3b050c] shadow-2xl shadow-red-950/80 outline-none transition hover:scale-105 sm:h-60 sm:w-60 md:h-72 md:w-72"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={unlocking ? { scale: [1, 1.05, 1.02], rotate: [0, -2, 2, 0] } : { scale: 1, opacity: 1 }}
                  exit={{ scale: 1.25, opacity: 0, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Abrir presente"
                >
                  <motion.span
                    className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 bg-[#ffd2c5]/95"
                    animate={unlocking ? { x: [-20, -70, -130], opacity: [1, 1, 0], rotate: [0, -8, -18] } : { x: -20 }}
                    transition={{ duration: 1.15, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="absolute left-0 top-1/2 h-10 w-full -translate-y-1/2 bg-[#ffd2c5]/95"
                    animate={unlocking ? { scaleX: [1, 1.05, 0.15], opacity: [1, 1, 0] } : { scaleX: 1 }}
                    transition={{ duration: 1.15, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="absolute -top-10 left-1/2 flex h-24 w-40 -translate-x-1/2 items-center justify-center"
                    animate={unlocking ? { y: [-5, -30, -80], opacity: [1, 1, 0], rotate: [0, 12, 28], scale: [1, 1.1, 0.7] } : { y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
                    transition={unlocking ? { duration: 1.2, ease: "easeInOut" } : { repeat: Infinity, duration: 2.6 }}
                  >
                    <span className="h-20 w-20 rounded-full border-[18px] border-rose-100 bg-transparent" />
                    <span className="-ml-5 h-20 w-20 rounded-full border-[18px] border-rose-100 bg-transparent" />
                  </motion.span>
                  <Gift className="absolute bottom-8 left-1/2 h-12 w-12 -translate-x-1/2 text-white/90" />
                  <span className="absolute -bottom-16 left-1/2 w-72 -translate-x-1/2 text-sm font-semibold text-[#f0c0b2]">
                    {unlocking ? "Desamarrando seu presente..." : "Clique para desamarrar o laço"}
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="opened"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-[#7a2a38] bg-[#fff1ed]/85 p-5 shadow-[0_0_30px_rgba(255,90,120,0.12)] backdrop-blur-xl"
                >
                  <p className="text-lg font-bold text-[#4a0d18]">Presente aberto!</p>
                  <p className="mt-1 text-sm font-medium text-[#5c1b28]">
                    Aguarde um instante... estamos revelando sua roleta.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section ref={rouletteRef} className={`relative px-4 py-16 transition-all duration-700 md:px-5 md:py-20 ${canAdvance ? "opacity-100" : "pointer-events-none max-h-screen overflow-hidden opacity-20 blur-sm"}`}> 
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700">
              <Heart className="h-4 w-4" />
              Roleta do amor
            </div>
            <h2 className="mt-5 text-3xl font-black md:text-5xl">Gire e descubra sua surpresa</h2>
            <p className="mt-5 text-base leading-8 text-[#7b3b4f]">
              Cada fatia guarda uma possibilidade. Os melhores prêmios têm menor chance, deixando a brincadeira mais justa, divertida e especial.
            </p>

            <div className="mt-10 rounded-3xl border border-[#5b1824] bg-[#12070b]/80 p-6 shadow-[0_0_35px_rgba(255,70,90,0.15)] backdrop-blur-xl">
              <p className="text-lg italic leading-8 text-[#f0c0b2]">
                “O amor está nos detalhes, nos olhares, nos momentos inesperados e nas pequenas surpresas.”
              </p>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border border-[#5a1825] bg-[#12070b]/90 shadow-[0_0_50px_rgba(255,70,90,0.18)] backdrop-blur-xl">
            <CardContent className="p-6 md:p-10">
              <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center sm:h-[360px] sm:w-[360px] md:h-[430px] md:w-[430px]">
                <div className="absolute -top-1 left-1/2 z-30 h-0 w-0 -translate-x-1/2 border-l-[18px] border-r-[18px] border-t-[38px] border-l-transparent border-r-transparent border-t-[#f3c2b4] drop-shadow-[0_0_12px_rgba(255,120,140,0.45)]" />

                <motion.div
                  className="relative h-full w-full rounded-full shadow-[0_0_50px_rgba(255,90,90,0.28)]"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4.3, ease: [0.12, 0.72, 0.18, 1] }}
                >
                  <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible rounded-full" aria-label="Roleta de prêmios">
                    <defs>
                      <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.35" />
                      </filter>
                    </defs>

                    <circle cx="200" cy="200" r="194" fill="#f3c2b4" filter="url(#wheelShadow)" />
                    <circle cx="200" cy="200" r="181" fill="#26070d" />

                    {prizes.map((prize, index) => {
                      const slice = 360 / prizes.length;
                      const startAngle = index * slice;
                      const endAngle = startAngle + slice;
                      const middleAngle = startAngle + slice / 2;
                      const labelPosition = polarToCartesian(200, 200, 112, middleAngle);
                      const labelLines = splitPrizeLabel(prize.label);

                      return (
                        <g key={prize.label}>
                          <path
                            d={describeSlice(200, 200, 178, startAngle, endAngle)}
                            fill={rouletteColors[index]}
                            stroke="#f8c8bc"
                            strokeWidth="2"
                          />

                          <text
                            x={labelPosition.x}
                            y={labelPosition.y - (labelLines.length - 1) * 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#fff7f3"
                            fontSize="15"
                            fontWeight="900"
                            letterSpacing="0.4"
                            style={{ textShadow: "0 3px 8px rgba(0,0,0,0.65)" }}
                          >
                            {labelLines.map((line, lineIndex) => (
                              <tspan key={line} x={labelPosition.x} dy={lineIndex === 0 ? 0 : 18}>
                                {line}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      );
                    })}

                    <circle cx="200" cy="200" r="56" fill="#f3c2b4" />
                    <circle cx="200" cy="200" r="43" fill="#fff7f3" />
                    <path
                      d="M200 224 C169 205 170 176 191 174 C197 173 201 177 200 178 C204 174 211 173 217 177 C235 188 225 211 200 224Z"
                      fill="#ff2d5d"
                    />
                  </svg>
                </motion.div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={spinRoulette}
                  disabled={!canAdvance || spinning || alreadyPlayed}
                  className="rounded-full bg-[#b8325f] px-8 py-6 text-base font-bold text-white hover:bg-[#9f294f] disabled:opacity-60"
                >
                  {!canAdvance ? "Abra o presente primeiro" : spinning ? "Girando..." : alreadyPlayed ? "Sorteio já realizado" : "Girar roleta"}
                </Button>

                {alreadyPlayed && winnerIndex === null && (
                  <p className="mt-4 text-sm font-medium text-[#7b3b4f]">
                    Este dispositivo já participou. Para validar o prêmio, confira as regras da promoção.
                  </p>
                )}

                <AnimatePresence>
                  {winner && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 rounded-3xl border border-rose-100 bg-rose-50 p-6"
                    >
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">Seu resultado</p>
                      <h3 className="mt-2 text-2xl font-black text-[#4a1d2b]">{winner.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#7b3b4f]">{winner.description}</p>

                      {winner.label === "Tente novamente" && (
                        <p className="mt-4 text-sm font-bold text-[#b11226]">
                          Você ganhou mais uma tentativa ❤️
                        </p>
                      )}

                      

                      <p className="mt-4 text-xs font-semibold text-[#7b3b4f]">
                        Tire um print desta tela e envie para validar seu prêmio.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className={`relative overflow-hidden px-4 pb-16 md:px-5 md:pb-20 ${canAdvance ? "opacity-100" : "pointer-events-none opacity-20 blur-sm"}`}>
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[
            "Que o amor esteja nos pequenos detalhes, nos gestos sinceros e nas surpresas que aquecem o coração.",
            "Neste Dia dos Namorados, celebre quem faz seus dias mais leves, bonitos e cheios de significado.",
            "Um presente especial não precisa ser grande. Precisa ter carinho, intenção e um toque de surpresa.",
          ].map((phrase) => (
            <Card key={phrase} className="rounded-3xl border-rose-100 bg-white/75 shadow-sm">
              <CardContent className="p-6">
                <Heart className="mb-4 h-6 w-6 fill-rose-400 text-rose-400" />
                <p className="leading-7 text-[#7b3b4f]">{phrase}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-[#5a1825] bg-[#090909] px-5 py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3d0912_0%,transparent_45%)] opacity-50" />

        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#5a1825] bg-[#14070b]/90 p-8 shadow-[0_0_40px_rgba(255,60,90,0.18)] backdrop-blur-xl">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-3xl font-black leading-tight text-[#f3c2b4] md:text-4xl">
                Siga nosso Instagram e
                <span className="block text-[#ffb29d]">GANHE UM BRINDE na loja!</span>
              </p>

              <p className="mt-5 text-base leading-8 text-[#e2b1a5]">
                Produtos íntimos, lingeries sensuais e experiências especiais para deixar seus momentos ainda mais marcantes.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#6e2330] bg-[#1c0b10] px-5 py-3 text-sm font-semibold text-[#f3c2b4]">
                @_intimestudio
              </div>

              <p className="mt-6 text-sm text-[#c9978c]">
                Apresente que está seguindo para retirar seu brinde.
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#6e1022]/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-[#5d1a27] bg-[#0f0508] p-6 shadow-[0_0_40px_rgba(255,80,110,0.2)]">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=https://instagram.com/_intimestudio"
                  alt="QR Code Instagram"
                  className="h-56 w-56 rounded-2xl border-4 border-[#f0b8aa] bg-white p-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-[#55202b] pt-6 text-sm text-[#d6a396] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-[#ff9f93]" />
              Ambiente seguro • Seus dados protegidos
            </div>

            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Limitado a 1 participação por dispositivo
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

import FloatingButterflies from "./FloatingButterflies";

export default function AnimatedBackground({ variant = "light" }: { variant?: "light" | "dark" }) {
  if (variant === "dark") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="float-orb absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(38,45%,65%) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="float-orb-2 absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, hsl(38,30%,50%) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
        <FloatingButterflies count={5} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="float-orb absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(38,55%,72%) 0%, hsl(40,40%,85%) 40%, transparent 70%)", filter: "blur(55px)" }}
      />
      <div
        className="float-orb-2 absolute -bottom-20 -left-20 w-[420px] h-[420px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(350,30%,78%) 0%, hsl(35,25%,88%) 40%, transparent 70%)", filter: "blur(50px)" }}
      />
      <div
        className="float-orb-3 absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, hsl(225,40%,60%) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div className="shimmer absolute inset-0 opacity-30" />
      <FloatingButterflies count={7} />
    </div>
  );
}

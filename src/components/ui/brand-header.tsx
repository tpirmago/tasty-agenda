export function BrandHeader() {
  return (
    <div className="flex flex-col items-center">
      <h1
        className="text-5xl font-black tracking-widest uppercase text-center"
        style={{ color: '#415B8F' }}
      >
        Tasty Agenda
      </h1>

      {/* Wavy line */}
      <svg
        width="220"
        height="18"
        viewBox="0 0 220 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mt-5 mb-5"
      >
        <path
          d="M0 9 C14 2, 28 16, 42 9 C56 2, 70 16, 84 9 C98 2, 112 16, 126 9 C140 2, 154 16, 168 9 C182 2, 196 16, 210 9"
          stroke="#415B8F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-16 w-full min-h-[600px]">
      {children}
    </div>
  );
}

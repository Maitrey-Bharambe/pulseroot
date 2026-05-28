import "./globals.css";
import Navigation from "@/components/Navigation";
import AuthGate from "@/components/AuthGate";

export const metadata = {
  title: "PulseRoot | AI Smart Plant Monitoring & Irrigation Platform",
  description: "Secure, scalable precision agriculture operating system utilizing real-time ESP32 telemetry, AI-driven preventive alerts, and automatic water pump controls."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex bg-[#FCEDE8] text-[#1C3B2B] selection:bg-[#4A5E2B]/25 selection:text-[#1C3B2B] font-sans antialiased">
        <AuthGate>
          <div className="flex w-full min-h-screen relative overflow-hidden">
            <Navigation />
            <main className="flex-grow flex flex-col overflow-y-auto h-screen w-full no-scrollbar">
              {children}
            </main>
          </div>
        </AuthGate>
      </body>
    </html>
  );
}

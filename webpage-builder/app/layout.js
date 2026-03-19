import './globals.css';

export const metadata = {
  title: 'Webpage Builder',
  description: 'AI-powered mobile webpage builder',
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Metal+Mania&family=Butcherman&family=UnifrakturMaguntia&family=Bebas+Neue&family=Righteous&family=Boogaloo&family=Cormorant+Garamond:wght@400;600;700&family=Playfair+Display:wght@400;700&family=IM+Fell+English&family=Inter:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;600;700&display=swap';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}

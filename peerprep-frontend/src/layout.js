import './globals.css'

export const metadata = {
  title: 'LeetCode Tracker',
  description: 'Track your coding progress',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav>Your navbar</nav>
        {children}
        <footer>Your footer</footer>
        
        {/* ⚠️ ADD THIS SINGLE LINE */}
        <div id="modal-root"></div>
      </body>
    </html>
  );
}

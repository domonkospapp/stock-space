import getStockPrice from "components/actions/getStockPrice";
import Image from "next/image";

export default async function Home() {
  const results = await getStockPrice("US88160R1014");
  const { ticker, price, currency } = results;

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold tracking-tight text-center sm:text-left">
          Stock Space
        </h1>
        <h2>Your portfolio deserves better than Flatex’s UI.</h2>
        <p className="text-center sm:text-left">
          Upload your Flatex CSV and see your portfolio like never before.
        </p>
        <ul className="list-disc list-inside">
          <li>✅ No account needed</li>
          <li>✅ 100% private — all calculations happen in your browser</li>
          <li>✅ Clean, modern insights Flatex doesn’t give you</li>
        </ul>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Upload Your Flatex CSV
          </a>

          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try the Demo
          </a>
        </div>
        <h2>How it works</h2>
        <h3>Step 1: Export CSV from Flatex</h3>
        <p>Follow these steps to export your portfolio data from Flatex:</p>
        <h3>Step 2: Upload in Stock Space</h3>
        <p>Drag & drop your CSV file into the upload box on this page.</p>
        <h3>Step 3: Explore insights instantly</h3>
        <p>
          Once your data is uploaded, you can start exploring your portfolio
          insights instantly.
        </p>
        <h2>Why Stock Space?</h2>
        <p>Finally, a portfolio view that makes sense.</p>
        <ul>
          <li>
            Flatex, but better → Their UI is cluttered. Ours is clean and
            intuitive.
          </li>
          <li>
            Your data stays yours → All calculations happen client-side. We
            never see your data.
          </li>
          <li>
            More insights, less noise → Sector breakdowns, performance trends,
            and allocation clarity.
          </li>
        </ul>

        <h2>Not ready to upload yet?</h2>

        <p>
          Try the demo portfolio and explore Stock Space’s features risk-free.
        </p>

        <h2>Ready to see your portfolio the way it should be?</h2>

        <a
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Try the Demo
        </a>

        <a
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className="dark:invert"
            src="/vercel.svg"
            alt="Vercel logomark"
            width={20}
            height={20}
          />
          Upload Your Flatex CSV
        </a>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p>
          Stock Space is not affiliated with Flatex. Your data never leaves your
          browser.
        </p>
        <p className="text-center sm:text-left">
          TEST: {ticker} stock is {price} {currency} now.
        </p>
      </footer>
    </div>
  );
}

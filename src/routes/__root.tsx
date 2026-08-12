import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import appCss from "../styles.css?url";

const SITE_URL = "https://cutebooth.vercel.app";
const SITE_TITLE = "Cutebooth — Cute Korean Photo Strip Maker";
const SITE_DESCRIPTION =
	"Take four webcam photos and print a cute Korean-style vertical photo strip. Fully in your browser, nothing uploaded.";

function NotFoundComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="max-w-md text-center">
				<h1 className="text-7xl font-bold text-foreground">404</h1>
				<h2 className="mt-4 text-xl font-semibold text-foreground">
					Page not found
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<div className="mt-6">
					<Link
						to="/"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Go home
					</Link>
				</div>
			</div>
		</div>
	);
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
	console.error(error);
	const router = useRouter();

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="max-w-md text-center">
				<h1 className="text-xl font-semibold tracking-tight text-foreground">
					This page didn't load
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Something went wrong on our end. You can try refreshing or head back
					home.
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-2">
					<button
						type="button"
						onClick={() => {
							router.invalidate();
							reset();
						}}
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Try again
					</button>
					<Link
						to="/"
						className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
					>
						Go home
					</Link>
				</div>
			</div>
		</div>
	);
}

export const Route = createRootRoute({
	head: () => {
		const baseUrl = new URL("/", SITE_URL).toString();
		const ogImage = new URL("/og-image.webp", SITE_URL).toString();

		return {
			meta: [
				{ charSet: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ title: SITE_TITLE },
				{ name: "description", content: SITE_DESCRIPTION },
				{ name: "theme-color", content: "#FFFDF1" },
				{ name: "color-scheme", content: "light" },
				{ name: "application-name", content: "CuteBooth" },
				{ name: "robots", content: "index, follow, max-image-preview:large" },
				{ property: "og:title", content: SITE_TITLE },
				{ property: "og:description", content: SITE_DESCRIPTION },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: baseUrl },
				{ property: "og:image", content: ogImage },
				{ property: "og:image:width", content: "1731" },
				{ property: "og:image:height", content: "909" },
				{
					property: "og:image:alt",
					content: "Photobooth — your strip, your moment",
				},
				{ property: "og:image:type", content: "image/webp" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: SITE_TITLE },
				{ name: "twitter:description", content: SITE_DESCRIPTION },
				{ name: "twitter:image", content: ogImage },
			],
			links: [
				{ rel: "stylesheet", href: appCss },
				{ rel: "canonical", href: baseUrl },
				{ rel: "icon", href: "/logo.png", type: "image/png" },
				{ rel: "apple-touch-icon", href: "/logo.png" },
			],
			scripts: [
				{
					type: "application/ld+json",
					children: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: "Photobooth",
						url: baseUrl,
						description: SITE_DESCRIPTION,
						applicationCategory: "PhotographyApplication",
						featureList: [
							"Four-photo webcam strips",
							"Korean-style photo strips",
							"Photo strip templates",
							"Browser-based photo booth",
						],
						browserRequirements: "Requires WebRTC getUserMedia",
						offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
						image: ogImage,
					}),
				},
			],
		};
	},
	shellComponent: RootShell,
	component: RootComponent,
	errorComponent: ErrorComponent,
	notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-booth-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-booth-paper"
				>
					Skip to main content
				</a>
				<Toaster
					position="bottom-center"
					toastOptions={{
						duration: 2500,
						style: {
							background: "var(--color-booth-paper)",
							color: "var(--color-booth-ink)",
							border:
								"2px solid color-mix(in srgb, var(--color-booth-ink) 10%, transparent)",
							borderRadius: "9999px",
							padding: "10px 16px",
							fontFamily: "var(--font-sans)",
							fontSize: "14px",
							fontWeight: "700",
							boxShadow: "var(--shadow-booth)",
						},
					}}
				/>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootComponent() {
	return <Outlet />;
}

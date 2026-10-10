import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Suite } from "@/components/site/suite";
import { TechMarquee } from "@/components/site/tech-marquee";
import { Capabilities } from "@/components/site/capabilities";
import { Workflow } from "@/components/site/workflow";
import { LiveAutomation } from "@/components/site/live-automation";
import { Projects } from "@/components/site/projects";
import { WhyUs } from "@/components/site/why-us";
import { Founders } from "@/components/site/founders";
import { Faq } from "@/components/site/faq";
import { Cta } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Suite />
        <TechMarquee />
        <Capabilities />
        <Workflow />
        <LiveAutomation />
        <Projects />
        <WhyUs />
        <Founders />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

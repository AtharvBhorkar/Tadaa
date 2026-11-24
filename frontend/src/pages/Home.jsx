import Hero from "../components/home/Hero";
import LevelCards from "../components/home/LevelCards";
import HowItWorks from "../components/home/HowItWorks";
import TrustStrip from "../components/home/TrustStrip";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import FAQ from "../components/home/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <LevelCards />
      <HowItWorks />
      <TrustStrip />
      <Categories />
      <FeaturedProducts />
      <FAQ />
    </>
  );
}
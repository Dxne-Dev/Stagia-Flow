import NavBar from '@/components/landing/nav-bar'
import HeroBand from '@/components/landing/hero-band'
import LogoStrip from '@/components/landing/logo-strip'
import FeaturesSection from '@/components/landing/features-section'
import ProductDemoSection from '@/components/landing/product-demo-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import PricingSection from '@/components/landing/pricing-section'
import CtaSection from '@/components/landing/cta-section'
import LandingFooter from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <NavBar />
      <main className="flex-1">
        <HeroBand />
        <LogoStrip />
        <FeaturesSection />
        <ProductDemoSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}

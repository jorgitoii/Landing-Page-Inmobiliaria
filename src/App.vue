<template>
  <div id="app-root">
    <SiteHeader />
    <HeroSection />
    <ArchitectsSection />
    <GallerySection />
    <LocationSection />
    <RestaurantSection />
    <PricingSection />
    <GaussianSplatSection />
    <GalleryModal />
    <AppointmentForm />
    <SiteFooter />
  </div>
</template>

<script setup>
import SiteHeader           from "./components/SiteHeader.vue"
import HeroSection          from "./components/HeroSection.vue"
import ArchitectsSection    from "./components/ArchitectsSection.vue"
import GallerySection       from "./components/GallerySection.vue"
import LocationSection      from "./components/LocationSection.vue"
import GaussianSplatSection from "./components/GaussianSplatSection.vue"
import RestaurantSection    from "./components/RestaurantSection.vue"
import PricingSection       from "./components/PricingSection.vue"
import GalleryModal         from "./components/GalleryModal.vue"
import AppointmentForm      from "./components/AppointmentForm.vue"
import SiteFooter           from "./components/SiteFooter.vue"
</script>

<style>
#app-root { position: relative; }
</style>

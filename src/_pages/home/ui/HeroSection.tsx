import Image from 'next/image'
import type { HomeResponse } from '@/entities/product'
import styles from './HeroSection.module.css'

type HeroSectionProps = Pick<HomeResponse['banner'], 'title' | 'description'>

export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <section className={styles.hero} aria-labelledby="week07-hero-title">
      {/* 1단계 변경: 원본 7.5MB를 그대로 내리던 <img>를 next/image로 교체한다.
          부모(.hero)가 position:relative + aspect-ratio로 공간을 이미 잡고 있어
          fill이 시각적 크기·비율·object-fit을 그대로 보존한다. */}
      <Image
        className={styles.image}
        src="/images/week-07/hero-original.jpg"
        alt=""
        fill
        sizes="100vw"
      />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>이번 주의 발견</p>
        <h1 id="week07-hero-title">{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}

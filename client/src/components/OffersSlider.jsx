import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import "./OffersSlider.css";

const offers = [
  {
    eyebrow: "THE PICKORA EDIT",
    title: "Find your next everyday favourite",
    detail: "Explore handpicked products across home, style, tech, and more.",
    icon: Sparkles,
  },
  {
    eyebrow: "A GOOD FIND",
    title: "Compare picks before you buy",
    detail: "Check the details, then visit the seller for current pricing.",
    icon: BadgePercent,
  },
  {
    eyebrow: "SHOP WITH TRUSTED STORES",
    title: "Buy directly from the seller",
    detail: "Pickora may earn a commission when you use our affiliate links.",
    icon: ExternalLink,
  },
];

export default function OffersSlider() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % offers.length),
      4500,
    );
    return () => window.clearInterval(timer);
  }, []);
  const offer = offers[active];
  const Icon = offer.icon;
  const go = (direction) =>
    setActive((index) => (index + direction + offers.length) % offers.length);
  return (
    <section className="offers-slider" aria-label="Shop offers">
      <div className="offer-art">
        <span className="offer-orbit offer-orbit-one" />
        <span className="offer-orbit offer-orbit-two" />
        <Icon size={46} />
      </div>
      <div className="offer-content" key={active}>
        <span className="offer-eyebrow">
          {offer.eyebrow} · 0{active + 1}
        </span>
        <h1>{offer.title}</h1>
        <p>{offer.detail}</p>
      </div>
      <div className="offer-controls">
        <button aria-label="Previous offer" onClick={() => go(-1)}>
          <ArrowLeft size={17} />
        </button>
        <div className="offer-dots">
          {offers.map((item, index) => (
            <button
              key={item.title}
              aria-label={`Show offer ${index + 1}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <button aria-label="Next offer" onClick={() => go(1)}>
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import "./BackgroundScene.css";

export default function BackgroundScene() {
  const houses = [
    {
      id: 1,
      className: "house house-one orbit-one",
      image: "/andrea-davis-NngNVT74o6s-unsplash.jpg",
    },
    {
      id: 2,
      className: "house house-two orbit-two",
      image: "/nick-kimel-GrLnSHJT1fI-unsplash.jpg",
    },
    {
      id: 3,
      className: "house house-three orbit-three",
      image: "/toa-heftiba-bnoPZ9aTyWQ-unsplash.jpg",
    },
  ];

  const rooms = [
    {
      id: 1,
      className: "room-card room-one orbit-four",
      image: "/ahmad-attari-AVFBwgQDbcI-unsplash.jpg",
    },
    {
      id: 2,
      className: "room-card room-two orbit-five",
      image: "/albert-vincent-wu-5LNoiVdL9SI-unsplash.jpg",
    },
    {
      id: 3,
      className: "room-card room-three orbit-six",
      image: "/yanny-mishchuk-QOZRLmfr8XY-unsplash.jpg",
    },
  ];

  const [houseTransforms, setHouseTransforms] = useState(
    houses.map(() => null)
  );
  const [roomTransforms, setRoomTransforms] = useState(rooms.map(() => null));

  const getRandomStyle = () => {
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = (Math.random() - 0.5) * 160;
    const randomRotate = (Math.random() - 0.5) * 20;
    const randomScale = 0.92 + Math.random() * 0.25;

    return {
      transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg) scale(${randomScale})`,
      animation: "none",
    };
  };

  const handleHover = (type, index) => {
    const style = getRandomStyle();
    if (type === "house") {
      setHouseTransforms(prev => {
        const next = [...prev];
        next[index] = style;
        return next;
      });
    } else {
      setRoomTransforms(prev => {
        const next = [...prev];
        next[index] = style;
        return next;
      });
    }
  };

  const resetHover = (type, index) => {
    if (type === "house") {
      setHouseTransforms((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    } else {
      setRoomTransforms((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    }
  };

  return (
    <div className="background-scene" aria-hidden="true">
      <div className="galaxy-gradient" />
      <div className="cosmic-noise" />
      <div className="starfield starfield-back" />
      <div className="starfield starfield-mid" />
      <div className="starfield starfield-front" />
      <div className="nebula sweep-one" />
      <div className="nebula sweep-two" />
      <div className="planet planet-one">
        <div className="planet-ring" />
      </div>
      <div className="planet planet-two" />
      <div className="planet planet-three">
        <div className="planet-glow" />
      </div>
      {[...Array(20)].map((_, idx) => (
        <span
          key={idx}
          className="particle-spark"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
        />
      ))}

      {houses.map((house, index) => (
        <div
          key={house.id}
          className={`${house.className} ${houseTransforms[index] ? "hovered" : ""}`}
          onMouseEnter={() => handleHover("house", index)}
          onMouseMove={() => handleHover("house", index)}
          onMouseLeave={() => resetHover("house", index)}
          style={houseTransforms[index] || undefined}
        >
          <img src={house.image} alt="" className="floating-photo" loading="lazy" />
        </div>
      ))}
      {rooms.map((room, index) => (
        <div
          key={room.id}
          className={`${room.className} ${roomTransforms[index] ? "hovered" : ""}`}
          onMouseEnter={() => handleHover("room", index)}
          onMouseMove={() => handleHover("room", index)}
          onMouseLeave={() => resetHover("room", index)}
          style={roomTransforms[index] || undefined}
        >
          <img src={room.image} alt="" className="floating-photo" loading="lazy" />
        </div>
      ))}
    </div>
  );
}


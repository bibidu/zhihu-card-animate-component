import React from 'react'
import './card.css'

export default function Card({ value, onToggleNext }) {
  return (
    <div
      className="card-container"
    >
      <div className="card-inner">
        <div>{value}</div>
        <div className="btn-group">
          <button onClick={onToggleNext}>换一个</button>
          <button onClick={() => console.log('发帖讨论', value)}>发帖讨论</button>
        </div>
      </div>
  </div>
  )
}
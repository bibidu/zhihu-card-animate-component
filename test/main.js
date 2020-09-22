import React from 'react'
import ReactDOM from 'react-dom'
import Card from './Card'
import CardScrollAnimate from '../src/animate'

let value = 1

const create = () => {
  const v = value++
  return <Card value={v} />
}
const initialPairs = [create(), create()]
const getNext = () => {
  return create()
}

function App() {
  return (
    <div className="App">
      <CardScrollAnimate
        initialPairs={initialPairs}
        getNext={getNext}
        animationTime={0.3}
        coverContainerScale={1.05}
        coverContainerTop={15}
        scrollThreshold={100}
      />
    </div>
  )
}

ReactDOM.render(
	<App />,
	document.getElementById('app')
);
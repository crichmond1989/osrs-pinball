import type { GrandExchangeOffer } from '../types'
import { getGrandExchangeOffers } from '../data/items'

interface GrandExchangeProps {
  gp: number
  onBuy: (offer: GrandExchangeOffer) => void
  onClose: () => void
}

export function GrandExchange({ gp, onBuy, onClose }: GrandExchangeProps) {
  const offers = getGrandExchangeOffers()

  return (
    <div
      data-testid="grand-exchange"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#2d1f0e',
          border: '2px solid #8B6914',
          borderRadius: 8,
          padding: 16,
          maxWidth: 400,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ color: '#FFD700', margin: 0, fontFamily: 'monospace' }}>
            Grand Exchange
          </h2>
          <button
            data-testid="ge-close"
            onClick={onClose}
            style={{
              background: '#6B4914',
              color: '#FFD700',
              border: 'none',
              padding: '4px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            Close
          </button>
        </div>
        <p style={{ color: '#FFD700', fontFamily: 'monospace', margin: '0 0 12px' }}>
          GP: {gp.toLocaleString()}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {offers.map((offer) => (
            <div
              key={offer.item.id}
              data-testid={`ge-offer-${offer.item.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#3d2a14',
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid #6B4914',
              }}
            >
              <span style={{ fontSize: 18 }}>{offer.item.icon}</span>
              <span style={{ color: '#ddd', fontFamily: 'monospace', flex: 1, marginLeft: 8, fontSize: 12 }}>
                {offer.item.name}
              </span>
              <button
                data-testid={`ge-buy-${offer.item.id}`}
                onClick={() => onBuy(offer)}
                disabled={gp < offer.price}
                style={{
                  background: gp >= offer.price ? '#2d5a1e' : '#555',
                  color: '#FFD700',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: 4,
                  cursor: gp >= offer.price ? 'pointer' : 'not-allowed',
                  fontFamily: 'monospace',
                  fontSize: 11,
                }}
              >
                {offer.price} gp
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

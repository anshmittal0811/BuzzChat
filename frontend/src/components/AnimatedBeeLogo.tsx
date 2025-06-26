import React from 'react';

interface AnimatedBeeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    container: 'w-6 h-8',
    body: 'w-4 h-6',
    stripes: ['top-1', 'top-2.5', 'top-4'],
    stripeHeight: 'h-0.5',
    wings: {
      container: '-top-0.5',
      wing: 'w-2 h-3',
      left: '-left-1.5',
      right: '-right-1.5'
    }
  },
  md: {
    container: 'w-8 h-12',
    body: 'w-6 h-8',
    stripes: ['top-1.5', 'top-3.5', 'top-5.5'],
    stripeHeight: 'h-1',
    wings: {
      container: '-top-1',
      wing: 'w-3 h-4',
      left: '-left-2',
      right: '-right-2'
    }
  },
  lg: {
    container: 'w-10 h-16',
    body: 'w-8 h-12',
    stripes: ['top-2', 'top-5', 'top-8'],
    stripeHeight: 'h-1.5',
    wings: {
      container: '-top-1',
      wing: 'w-4 h-6',
      left: '-left-3',
      right: '-right-3'
    }
  }
};

export const AnimatedBeeLogo: React.FC<AnimatedBeeLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeConfig = sizeClasses[size];

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="bee-container">
        <div className="bee-body">
          {/* Bee body */}
          <div className={`${sizeConfig.container} bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full relative`}>
            {/* Black stripes */}
            {sizeConfig.stripes.map((topClass, index) => (
              <div 
                key={index}
                className={`absolute ${topClass} left-0 right-0 ${sizeConfig.stripeHeight} bg-black rounded-full`}
              />
            ))}
          </div>
          
          {/* Wings */}
          <div className={`bee-wings absolute ${sizeConfig.wings.container} left-1/2 transform -translate-x-1/2`}>
            <div className={`wing-left absolute ${sizeConfig.wings.left} ${sizeConfig.wings.wing} bg-white/60 rounded-full transform -rotate-12 animate-flutter`}></div>
            <div className={`wing-right absolute ${sizeConfig.wings.right} ${sizeConfig.wings.wing} bg-white/60 rounded-full transform rotate-12 animate-flutter-reverse`}></div>
          </div>
          
          {/* Antennae */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-0.5 h-3 bg-black rotate-12 absolute -left-1"></div>
            <div className="w-0.5 h-3 bg-black -rotate-12 absolute left-1"></div>
            <div className="w-1 h-1 bg-black rounded-full absolute -left-1 -top-1"></div>
            <div className="w-1 h-1 bg-black rounded-full absolute left-1 -top-1"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .bee-container {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes flutter {
          0%, 100% { transform: rotate(-12deg) scaleY(1); }
          50% { transform: rotate(-25deg) scaleY(0.8); }
        }
        
        @keyframes flutter-reverse {
          0%, 100% { transform: rotate(12deg) scaleY(1); }
          50% { transform: rotate(25deg) scaleY(0.8); }
        }
        
        .animate-flutter {
          animation: flutter 0.3s ease-in-out infinite;
        }
        
        .animate-flutter-reverse {
          animation: flutter-reverse 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedBeeLogo;
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left relative z-10 bg-white/80 backdrop-blur-sm p-6 rounded-xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Découvrez l&apos;Innovation avec{' '}
              <span className="text-[#fc6f03]">Smartify Store</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-800 max-w-2xl mx-auto lg:mx-0">
              Votre destination pour des produits innovants et intelligents. 
              Qualité, innovation et service client exceptionnel.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-[#fc6f03] hover:bg-[#e56500] transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Découvrir nos produits
              </Link>
              <Link
                href="/products"
                className="inline-flex bg-gray-800 items-center justify-center px-8 py-4 border border-white/20 text-base font-medium rounded-lg text-white hover:bg-gray-600 transition-colors duration-200"
              >
                Explorer les catégories
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative w-full h-[300px] max-w-4xl mx-auto">
              <Image
                src="/images/hero.png"
                alt="Smartify Products"
                fill
                className="object-contain scale-150"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
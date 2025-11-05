export default function OurBelief() {
  return (
    <section className="py-[100px]">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center">
          {/* Heading */}
          <h2 className="text-[40px] md:text-[32px] sm:text-[32px] font-bold mb-12">
            What We Believe
          </h2>

          {/* First block - Core beliefs */}
          <div className="mb-10">
            <p className="text-[28px] md:text-[24px] sm:text-[24px] leading-[1.4] font-semibold">
              Every business is unique.
            </p>
            <p className="text-[28px] md:text-[24px] sm:text-[24px] leading-[1.4] font-semibold">
              Your software should be too.
            </p>
          </div>

          {/* Second block - Muted text */}
          <div className="mb-10">
            <p className="text-[24px] md:text-[20px] sm:text-[20px] text-muted-foreground">
              Custom software shouldn't require venture funding.
            </p>
          </div>

          {/* Third block - Highlighted box */}
          <div className="bg-primary/5 p-10 rounded-2xl">
            <p className="text-[20px]">
              We're building the alternative to one-size-fits-all solutions and $100k+ development projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

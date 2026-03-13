import Link from "next/link";

interface BreadcrumbProps {
  pageName: string;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <nav>
        <ol className="flex items-center gap-2 text-sm text-[#907F6A] dark:text-dark-6">
          <li>
            <Link className="font-medium transition hover:text-primary" href="/">
              Dashboard
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-primary">{pageName}</li>
        </ol>
      </nav>

      <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-dark dark:text-white">
        {pageName}
      </h2>
    </div>
  );
};

export default Breadcrumb;

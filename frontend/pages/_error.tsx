import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode: number }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-500 font-mono text-xs uppercase tracking-widest">
      <p>
        {statusCode
          ? `Error ${statusCode} en el servidor Ring-0`
          : 'Error en el cliente de telemetría'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

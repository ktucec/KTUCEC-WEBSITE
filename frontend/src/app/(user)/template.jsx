// Her sayfa değişiminde içerik yumuşakça (bulanıklıktan netleşerek) gelir.
export default function UserTemplate({ children }) {
    return <div className="page-enter">{children}</div>;
}

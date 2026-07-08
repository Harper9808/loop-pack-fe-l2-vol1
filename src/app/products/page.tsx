import { products } from './data'
import { ProductCard } from './_components/ProductCard'
import { ControlledDialogDemo } from './_components/ControlledDialogDemo'
import styles from './page.module.css'

export default function ProductsPage() {
  return (
    <main className={styles.page}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      <ControlledDialogDemo />
    </main>
  )
}

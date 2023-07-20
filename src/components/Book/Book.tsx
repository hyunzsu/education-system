import {useRecoilValue} from "recoil";
import {bookAtom} from "@/atoms";
import { ReactComponent as BookmarkEmpty } from "@/assets/bookmark-empty.svg";
import { ReactComponent as BookmarkFill } from '@/assets/bookmark-fill.svg';
import styles from "./Book.module.css";
import useBook from '@/hooks/useBook';

const Book = ({className}: {className: string}) => {

    const book  = useRecoilValue(bookAtom);
    const {addBook, deleteBook} = useBook();

    //book이 false면 찜기능, true면 삭제기능
    const handleBook = () => {
        if(!book) {
            addBook();
        } else {
            deleteBook();
        }
    }

    return (
        <div className={`${className} ${styles.Book}`} onClick={handleBook}>
            {book === false ?  <BookmarkEmpty/> : <BookmarkFill/>}
        </div>
    )
}

export default Book
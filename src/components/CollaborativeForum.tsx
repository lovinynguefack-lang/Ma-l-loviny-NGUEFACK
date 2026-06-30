import React, { useState } from "react";
import { INITIAL_FORUM_POSTS } from "../data";
import { Post } from "../types";
import { MessageSquare, ThumbsUp, Send, Share2, Award, Paperclip, CheckCircle, HelpCircle } from "lucide-react";

interface CollaborativeForumProps {
  isPremiumUser: boolean;
}

export default function CollaborativeForum({ isPremiumUser }: CollaborativeForumProps) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_FORUM_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostRole, setNewPostRole] = useState<"Élève" | "Enseignant">("Élève");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Math.random().toString(),
      author: newPostRole === "Enseignant" ? "Prof. Amadou Koné" : "Yasmine Touré",
      role: newPostRole,
      avatar: newPostRole === "Enseignant" ? "👨‍🏫" : "👩‍🎓",
      content: newPostContent.trim(),
      timestamp: "À l'instant",
      likes: 0,
      commentsCount: 0,
      hasLiked: false,
      attachmentName: attachedFileName || undefined,
      attachmentType: attachedFileName ? "pdf" : undefined
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setAttachedFileName(null);
  };

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          return {
            ...post,
            hasLiked,
            likes: hasLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };

  const simulateAttachment = () => {
    const fileNames = ["Fiche_Histoire_Bac.pdf", "Exercices_Geometrie_Université.pdf", "Fiche_Synthese_Electricite.pdf"];
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
    setAttachedFileName(randomFile);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="forum-root">
      {/* Forum Feed */}
      <div className="lg:col-span-8 space-y-4">
        {/* Creator box */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
          <h3 className="font-display font-semibold text-gray-800">Partager ou Poser une question</h3>
          
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white resize-none h-24"
              placeholder="Un doute sur un exercice ? Partage-le ici avec la communauté d'enseignants et d'élèves..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">Poster en tant que :</span>
                  <button
                    type="button"
                    onClick={() => setNewPostRole("Élève")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                      newPostRole === "Élève"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Élève
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPostRole("Enseignant")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                      newPostRole === "Enseignant"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Enseignant
                  </button>
                </div>

                <button
                  type="button"
                  onClick={simulateAttachment}
                  className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-blue-600 font-medium px-2 py-1 rounded-md bg-gray-50 border border-gray-100"
                >
                  <Paperclip className="h-3 w-3" />
                  Joindre un document PDF
                </button>
              </div>

              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                Publier
              </button>
            </div>

            {attachedFileName && (
              <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] flex items-center justify-between border border-green-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> document joint : {attachedFileName}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFileName(null)}
                  className="text-red-500 font-bold hover:underline"
                >
                  Annuler
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">
                    {post.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                      {post.author}
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                        post.role === "Tuteur IA"
                          ? "bg-purple-100 text-purple-700"
                          : post.role === "Enseignant"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {post.role}
                      </span>
                    </h4>
                    <p className="text-[10px] text-gray-400 font-sans">{post.timestamp}</p>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-gray-600">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-sans">{post.content}</p>

              {post.attachmentName && (
                <div className="p-3 bg-blue-50/50 rounded-xl flex items-center justify-between border border-blue-50">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">PDF</span>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-800">{post.attachmentName}</h5>
                      <p className="text-[10px] text-gray-400">Ressource pédagogique partagée</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg text-[10px] font-semibold">
                    Consulter
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4 pt-3 border-t border-gray-50 text-[11px] text-gray-500 font-semibold">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                    post.hasLiked ? "text-blue-600" : ""
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {post.likes} J'aime
                </button>

                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.commentsCount} Commentaires
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forum Guidelines and Marketplace promotions */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3">
          <h3 className="font-display font-semibold text-gray-800">Espace Collaboratif</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-sans">
            Un lieu d'échange solidaire où élèves, tuteurs d'IA et professeurs collaborent pour surmonter toutes les difficultés scolaires d'Afrique francophone.
          </p>

          <div className="space-y-2 pt-2 text-[11px]">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✔</span>
              <p className="text-gray-600">Aide aux devoirs bienveillante et expliquée pas-à-pas.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✔</span>
              <p className="text-gray-600">Partage de fiches, d'annales corrigées de lycées d'excellence.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✔</span>
              <p className="text-gray-600">Modération rigoureuse assurée par des enseignants agrégés.</p>
            </div>
          </div>
        </div>

        {/* Marketplace banner */}
        <div className="bg-linear-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📚</span>
            <h4 className="font-display font-bold text-amber-900 text-sm">Marketplace Enseignants</h4>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Vous êtes enseignant ? Publiez vos meilleurs documents et cours exclusifs sur notre marketplace, fixez votre tarif de vente et gagnez des revenus complémentaires (commission réduite de 15%).
          </p>
          <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all">
            Devenir Vendeur Partenaire
          </button>
        </div>
      </div>
    </div>
  );
}
